/**
 * 智能脚手架 — deterministic generators that give LVJIN AI "hands".
 *
 * A website can't reach into the user's machine, so the closest we can do is
 * generate **correct, ready-to-run** artifacts the user pastes into their own
 * terminal. The LLM's job is only to pick the parameters from a messy question;
 * these pure functions produce the actual output so it's never hallucinated.
 *
 * Everything here is grounded in the site's own curriculum (chapter 3 teaches
 * conda + Python 3.10 + source install via `pip install -e .`) and the shared
 * error database — so the generated steps match what the lessons teach.
 */

import { errorDatabase } from '@/lib/course-data'
import { errorDatabaseJa } from '@/lib/course-data-ja'
import type { DiagnosticResult } from '@/lib/types'

export type OS = 'windows' | 'macos' | 'linux'
export type GPU = 'nvidia' | 'apple' | 'none'
export type Installer = 'conda' | 'venv'
/** Which language the generated step text / diagnosis should be in. */
export type ScaffoldLocale = 'zh' | 'ja'

export interface SetupParams {
  os: OS
  gpu: GPU
  /** conda is recommended (and what the lessons teach); venv is the fallback. */
  installer?: Installer
}

export interface SetupStep {
  /** Short label for the step. */
  label: string
  /** The exact command(s) to run. */
  command: string
  /** Plain-language note: what it does / what to watch for. */
  note?: string
}

export interface SetupPlan {
  steps: SetupStep[]
  /** Everything as one copy-paste block (comments included). */
  script: string
  /** Caveats specific to the chosen hardware. */
  notes: string[]
}

const OS_LABEL: Record<OS, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' }
const GPU_LABEL: Record<ScaffoldLocale, Record<GPU, string>> = {
  zh: { nvidia: 'NVIDIA 显卡', apple: 'Apple 芯片', none: '无独立显卡' },
  ja: { nvidia: 'NVIDIA GPU', apple: 'Apple シリコン', none: '独立 GPU 無し' }
}

/** ffmpeg install line per OS (needed for video encode/decode during recording). */
function ffmpegStep(os: OS, installer: Installer, loc: ScaffoldLocale): SetupStep {
  const ja = loc === 'ja'
  if (installer === 'conda') {
    return {
      label: ja ? 'ffmpeg をインストール（動画コーデック）' : '安装 ffmpeg（视频编解码）',
      command: 'conda install -y ffmpeg -c conda-forge',
      note: ja
        ? '収録時の動画記録に ffmpeg が必要です。conda が最も簡単で、OS をまたいで一貫します。'
        : '采集时录视频需要 ffmpeg。用 conda 装最省事，跨系统一致。'
    }
  }
  if (os === 'linux') {
    return {
      label: ja ? 'ffmpeg をインストール' : '安装 ffmpeg',
      command: 'sudo apt update && sudo apt install -y ffmpeg',
      note: ja
        ? 'Debian/Ubuntu は apt。他のディストリは対応するパッケージマネージャを使ってください。'
        : 'Debian/Ubuntu 用 apt；其他发行版用对应包管理器。'
    }
  }
  if (os === 'macos') {
    return {
      label: ja ? 'ffmpeg をインストール' : '安装 ffmpeg',
      command: 'brew install ffmpeg',
      note: ja ? '先に Homebrew（brew.sh）が必要です。' : '需要先装 Homebrew（brew.sh）。'
    }
  }
  return {
    label: ja ? 'ffmpeg をインストール' : '安装 ffmpeg',
    command: 'winget install Gyan.FFmpeg',
    note: ja
      ? 'Windows は ffmpeg.org からダウンロードして PATH に追加してもOK。'
      : 'Windows 也可去 ffmpeg.org 下载并加进 PATH。'
  }
}

/** Activation command differs by installer + OS. */
function activateStep(os: OS, installer: Installer, loc: ScaffoldLocale): SetupStep {
  const ja = loc === 'ja'
  if (installer === 'conda') {
    return {
      label: ja ? '環境を有効化（新しいターミナルごとに必要）' : '激活环境（每开新终端都要做）',
      command: 'conda activate lerobot',
      note: ja
        ? '有効化忘れは ModuleNotFoundError の最多原因です。プロンプトに (lerobot) が出れば成功。'
        : '忘记激活是 ModuleNotFoundError 的头号原因。提示符出现 (lerobot) 才算成功。'
    }
  }
  return {
    label: ja ? '環境を有効化（新しいターミナルごとに必要）' : '激活环境（每开新终端都要做）',
    command: os === 'windows' ? 'lerobot-env\\Scripts\\activate' : 'source lerobot-env/bin/activate',
    note: ja ? 'プロンプトに (lerobot-env) が出れば成功。' : '提示符出现 (lerobot-env) 才算成功。'
  }
}

function createEnvStep(installer: Installer, loc: ScaffoldLocale): SetupStep {
  const ja = loc === 'ja'
  if (installer === 'conda') {
    return {
      label: ja ? '独立環境を作成（Python 3.10）' : '创建独立环境（Python 3.10）',
      command: 'conda create -n lerobot python=3.10 -y',
      note: ja
        ? 'conda が無ければ先に Miniconda を（Anaconda は重いので不要）：docs.conda.io。-y は確認せずインストールする意味です。'
        : '没装 conda 先装 Miniconda（不要 Anaconda，太重）：docs.conda.io。-y 表示不再追问、直接装。'
    }
  }
  return {
    label: ja ? '独立環境を作成（Python 3.10）' : '创建独立环境（Python 3.10）',
    command: 'python3.10 -m venv lerobot-env',
    note: ja
      ? 'ローカルに Python 3.10 が必要です。conda 推奨（Python のバージョン自体も隔離できます）。'
      : '需要本机已有 Python 3.10。推荐用 conda，能顺带隔离 Python 版本本身。'
  }
}

/** GPU-specific caveats + an optional extra step. */
function gpuAdvice(gpu: GPU, loc: ScaffoldLocale): { notes: string[]; extra?: SetupStep } {
  const ja = loc === 'ja'
  if (gpu === 'nvidia') {
    return {
      notes: ja
        ? [
            'インストール後の検証で cuda が False の場合：CPU 版 PyTorch が入っています。CUDA バージョンに合わせて再インストールしてください。例：`pip install --force-reinstall torch --index-url https://download.pytorch.org/whl/cu121`（cu121 は自分のバージョンに置換）。',
            '`nvidia-smi` 右上の CUDA Version を見て cu118 / cu121 / cu124 を選びます。'
          ]
        : [
            '装完跑验证那步，如果 cuda 显示 False：说明装到了 CPU 版 PyTorch。按你的 CUDA 版本重装，例如 `pip install --force-reinstall torch --index-url https://download.pytorch.org/whl/cu121`（cu121 换成你的版本）。',
            '用 `nvidia-smi` 看右上角 CUDA Version 决定用 cu118 / cu121 / cu124。'
          ]
    }
  }
  if (gpu === 'apple') {
    return {
      notes: ja
        ? [
            'Apple シリコンは MPS バックエンドを使用。推論や小規模な学習は可能ですが、大規模データの学習は遅めです。',
            '検証で cuda は False になりますが正常です（Mac に CUDA は無い）。MPS を使えばOK。'
          ]
        : [
            'Apple 芯片用 MPS 后端，能跑推理与小规模训练；大数据集训练仍偏慢。',
            '验证那步 cuda 会是 False，这是正常的（Mac 没有 CUDA），用 MPS 即可。'
          ]
    }
  }
  return {
    notes: ja
      ? [
          '独立 GPU 無し：概念学習・環境構築・データ収集・実機推論はすべて可能。',
          'ACT の「モデル学習」だけは GPU を多用します。GPU が無ければクラウド GPU（Colab / AutoDL 等）で学習ステップだけ回し、収集と推論はローカルでOK。'
        ]
      : [
          '无独立显卡:概念学习、环境搭建、数据采集、实机推理都能做。',
          '只有 ACT「模型训练」很吃 GPU——没显卡可先用云 GPU（如 Colab / AutoDL）只跑训练那一步,采集和部署仍在本地。'
        ]
  }
}

/**
 * Build a tailored LeRobot environment setup plan, grounded in chapter 3.
 */
export function buildSetupScript(p: SetupParams, loc: ScaffoldLocale = 'zh'): SetupPlan {
  const ja = loc === 'ja'
  const installer: Installer = p.installer ?? 'conda'
  const steps: SetupStep[] = [
    createEnvStep(installer, loc),
    activateStep(p.os, installer, loc),
    ffmpegStep(p.os, installer, loc),
    {
      label: ja ? 'LeRobot のソースを取得' : '获取 LeRobot 源码',
      command: 'git clone https://github.com/huggingface/lerobot.git',
      note: ja
        ? '先に git が必要です。コードを置きたいディレクトリにクローンします。'
        : '需要先装 git。克隆到你想放代码的目录下。'
    },
    {
      label: ja ? 'LeRobot をインストール' : '安装 LeRobot',
      command: 'cd lerobot && pip install -e .',
      note: ja
        ? 'ソースから編集可能インストール（サイト第 3 章と同じ）。完了後 lerobot-record / lerobot-train などが使えます。'
        : '从源码可编辑安装(站内第 3 章一致)。装好后 lerobot-record / lerobot-train 等命令即可用。'
    },
    {
      label: ja ? 'インストールを検証' : '验证安装',
      command: `python -c "import lerobot, torch; print('lerobot OK; cuda:', torch.cuda.is_available())"`,
      note: ja
        ? '「lerobot OK」が出れば成功。cuda が True かは下の GPU 説明を参照。'
        : '看到 “lerobot OK” 就装好了。cuda 是否为 True 见下方显卡说明。'
    }
  ]

  const { notes, extra } = gpuAdvice(p.gpu, loc)
  if (extra) steps.splice(5, 0, extra)

  const header = ja
    ? `# LeRobot 環境セットアップスクリプト — ${OS_LABEL[p.os]} · ${GPU_LABEL.ja[p.gpu]} · ${installer}\n# LVJIN AI がサイト第 3 章に基づき生成。1 行ずつターミナルに貼って実行。sudo はパスワードを求められます。`
    : `# LeRobot 环境一键脚本 — ${OS_LABEL[p.os]} · ${GPU_LABEL.zh[p.gpu]} · ${installer}\n# 由 LVJIN AI 按站内第 3 章生成。逐行复制到终端运行;遇到 sudo 会让你输密码。`
  const script = [header, '', ...steps.map((s) => `# ${s.label}\n${s.command}`)].join('\n')

  return { steps, script, notes }
}

/* ── lerobot 命令生成器 ─────────────────────────────────────────────────── */

export interface RecordParams {
  robotPort?: string
  teleopPort?: string
  repoId?: string
  numEpisodes?: number
  fps?: number
  singleTask?: string
}

export function buildRecordCommand(p: RecordParams): string {
  const robotPort = p.robotPort ?? '/dev/ttyACM0'
  const teleopPort = p.teleopPort ?? '/dev/ttyACM1'
  const repoId = p.repoId ?? 'your-name/so101-pick-place'
  const numEpisodes = p.numEpisodes ?? 50
  const fps = p.fps ?? 30
  const task = p.singleTask ?? 'Pick up the cube and place it in the box'
  return [
    'lerobot-record \\',
    '  --robot.type=so101_follower \\',
    `  --robot.port=${robotPort} \\`,
    '  --teleop.type=so101_leader \\',
    `  --teleop.port=${teleopPort} \\`,
    `  --dataset.repo_id=${repoId} \\`,
    `  --dataset.num_episodes=${numEpisodes} \\`,
    `  --dataset.fps=${fps} \\`,
    `  --dataset.single_task="${task}" \\`,
    '  --display_data=true'
  ].join('\n')
}

export interface TrainParams {
  repoId?: string
  batchSize?: number
  steps?: number
  outputDir?: string
}

export function buildTrainCommand(p: TrainParams): string {
  const repoId = p.repoId ?? 'your-name/so101-pick-place'
  const batchSize = p.batchSize ?? 8
  const steps = p.steps ?? 100_000
  const out = p.outputDir ?? 'outputs/train/act_so101'
  return [
    'lerobot-train \\',
    `  --dataset.repo_id=${repoId} \\`,
    '  --policy.type=act \\',
    `  --batch_size=${batchSize} \\`,
    `  --steps=${steps} \\`,
    `  --output_dir=${out}`
  ].join('\n')
}

export interface EvalParams {
  robotPort?: string
  policyPath?: string
  fps?: number
}

export function buildEvalCommand(p: EvalParams): string {
  const robotPort = p.robotPort ?? '/dev/ttyACM0'
  const policyPath = p.policyPath ?? 'outputs/train/act_so101/checkpoints/last/pretrained_model'
  const fps = p.fps ?? 30
  return [
    'lerobot-record \\',
    '  --robot.type=so101_follower \\',
    `  --robot.port=${robotPort} \\`,
    `  --policy.path=${policyPath} \\`,
    `  --dataset.repo_id=your-name/eval-run \\`,
    `  --dataset.num_episodes=10 \\`,
    `  --dataset.fps=${fps}`
  ].join('\n')
}

/* ── 报错诊断 ───────────────────────────────────────────────────────────── */

export interface DiagnoseHit {
  key: string
  result: DiagnosticResult
  score: number
}

const errorEntries = Object.entries(errorDatabase).map(([key, result]) => ({ key, result }))
const errorEntriesJa = Object.entries(errorDatabaseJa).map(([key, result]) => ({ key, result }))

/** Keyword-match a raw error message against the site error database. */
export function diagnoseError(text: string, limit = 3, loc: ScaffoldLocale = 'zh'): DiagnoseHit[] {
  const q = text.toLowerCase().trim()
  if (!q) return []
  const terms = q.split(/[\s,:;]+/).filter((t) => t.length >= 3)
  const hits: DiagnoseHit[] = []
  for (const { key, result } of loc === 'ja' ? errorEntriesJa : errorEntries) {
    const hay = `${key} ${result.error} ${result.cause} ${result.solution}`.toLowerCase()
    let score = 0
    if (hay.includes(q)) score += 10 // whole-string hit
    for (const t of terms) if (hay.includes(t)) score += 1
    if (score > 0) hits.push({ key, result, score })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}
