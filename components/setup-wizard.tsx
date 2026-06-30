'use client'

/**
 * 环境向导 — the deterministic side of LVJIN AI's "hands".
 *
 * A guided form that turns "what's your machine?" into a correct, copy-paste
 * LeRobot setup script (grounded in chapter 3 via lib/scaffold), plus a paste-
 * your-error diagnoser backed by the site error database. No LLM, no tokens, no
 * hallucination — the AI chat reuses the same generators conversationally.
 */

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Cpu, MonitorSmartphone, Wrench, Stethoscope, Search, ArrowRight, Bot } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CodeBlock } from '@/components/code-block'
import {
  buildSetupScript,
  diagnoseError,
  type OS,
  type GPU,
  type Installer,
  type DiagnoseHit
} from '@/lib/scaffold'
import { cn } from '@/lib/utils'

const OS_OPTS: { value: OS; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' }
]
const GPU_OPTS_ZH: { value: GPU; label: string }[] = [
  { value: 'nvidia', label: 'NVIDIA 显卡' },
  { value: 'apple', label: 'Apple 芯片' },
  { value: 'none', label: '没有/不确定' }
]
const GPU_OPTS_JA: { value: GPU; label: string }[] = [
  { value: 'nvidia', label: 'NVIDIA GPU' },
  { value: 'apple', label: 'Apple シリコン' },
  { value: 'none', label: 'なし／不明' }
]
const INSTALLER_OPTS_ZH: { value: Installer; label: string }[] = [
  { value: 'conda', label: 'conda（推荐）' },
  { value: 'venv', label: 'venv' }
]
const INSTALLER_OPTS_JA: { value: Installer; label: string }[] = [
  { value: 'conda', label: 'conda（推奨）' },
  { value: 'venv', label: 'venv' }
]

function Picker<T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-all',
              value === o.value
                ? 'border-primary/60 bg-primary/10 font-medium text-foreground'
                : 'border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SetupWizard({
  trigger,
  onAskAi
}: {
  trigger: React.ReactNode
  /** Optional: hand the generated text to the chat so the AI can walk through it. */
  onAskAi?: (text: string) => void
}) {
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const loc = isJa ? 'ja' : 'zh'
  const L = isJa
    ? {
        title: '環境ウィザード',
        tabSetup: '環境構築',
        tabDiagnose: 'エラー診断',
        setupIntro: 'お使いの PC を選ぶと、サイト第 3 章に沿ってそのまま実行できるインストールスクリプトを用意します。',
        os: 'OS',
        gpu: 'GPU',
        installer: '環境マネージャ',
        copyDesc: '全体をターミナルにコピーし、1 行ずつ実行：',
        gpuNote: '💡 あなたの GPU について',
        walkMe: 'LVJIN AI に手順を案内してもらう',
        diagnoseIntro: 'ターミナルの赤いエラーを貼り付けてください。原因と対処を調べます。',
        placeholder: "例：ModuleNotFoundError: No module named 'lerobot'",
        diagnose: '診断',
        noMatch: 'エラーベースに一致なし。',
        askAi: 'LVJIN AI に調べてもらう →',
        tryOther: ' 別のキーワードを試すか、LVJIN AI に聞いてください。',
        cause: '原因:',
        solution: '対処:',
        setupPrompt: (o: string, g: string, ins: string, script: string) =>
          `${o}、GPU は ${g}、${ins} で LeRobot 環境を構築します。このスクリプトに沿って一歩ずつ案内し、各ステップが何をするか説明してください：\n\n\`\`\`bash\n${script}\n\`\`\``,
        diagnosePrompt: (err: string) =>
          `このエラーが出ました。調査してください：\n\n\`\`\`\n${err}\n\`\`\``
      }
    : {
        title: '环境向导',
        tabSetup: '搭环境',
        tabDiagnose: '诊断报错',
        setupIntro: '选一下你的电脑,我按站内第 3 章给你一份能直接跑的安装脚本。',
        os: '操作系统',
        gpu: '显卡',
        installer: '环境管理器',
        copyDesc: '整段复制到终端,逐行执行:',
        gpuNote: '💡 针对你的显卡',
        walkMe: '让 LVJIN AI 带我一步步装',
        diagnoseIntro: '把终端里红色的报错粘进来,我帮你查根因和解决办法。',
        placeholder: "例如:ModuleNotFoundError: No module named 'lerobot'",
        diagnose: '诊断',
        noMatch: '错误库里没匹配到。',
        askAi: '让 LVJIN AI 帮你排查 →',
        tryOther: ' 试试换个关键词,或去问 LVJIN AI。',
        cause: '原因:',
        solution: '解决:',
        setupPrompt: (o: string, g: string, ins: string, script: string) =>
          `我在 ${o}、显卡是 ${g}、用 ${ins} 装 LeRobot 环境,请按这个脚本一步步带我装,并解释每步在做什么:\n\n\`\`\`bash\n${script}\n\`\`\``,
        diagnosePrompt: (err: string) => `我遇到这个报错,帮我排查:\n\n\`\`\`\n${err}\n\`\`\``
      }
  const gpuOpts = isJa ? GPU_OPTS_JA : GPU_OPTS_ZH
  const installerOpts = isJa ? INSTALLER_OPTS_JA : INSTALLER_OPTS_ZH

  const [open, setOpen] = useState(false)
  const [os, setOs] = useState<OS>('windows')
  const [gpu, setGpu] = useState<GPU>('none')
  const [installer, setInstaller] = useState<Installer>('conda')

  const [errText, setErrText] = useState('')
  const [hits, setHits] = useState<DiagnoseHit[] | null>(null)

  const plan = useMemo(() => buildSetupScript({ os, gpu, installer }, loc), [os, gpu, installer, loc])

  const runDiagnose = () => setHits(diagnoseError(errText, 3, loc))

  const askAi = (text: string) => {
    onAskAi?.(text)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-4 text-primary" /> {L.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup" className="gap-1.5">
              <MonitorSmartphone className="size-3.5" /> {L.tabSetup}
            </TabsTrigger>
            <TabsTrigger value="diagnose" className="gap-1.5">
              <Stethoscope className="size-3.5" /> {L.tabDiagnose}
            </TabsTrigger>
          </TabsList>

          {/* ── Setup ── */}
          <TabsContent value="setup" className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">{L.setupIntro}</p>
            <Picker icon={MonitorSmartphone} label={L.os} value={os} options={OS_OPTS} onChange={setOs} />
            <Picker icon={Cpu} label={L.gpu} value={gpu} options={gpuOpts} onChange={setGpu} />
            <Picker icon={Wrench} label={L.installer} value={installer} options={installerOpts} onChange={setInstaller} />

            <CodeBlock code={plan.script} language="bash" description={L.copyDesc} />

            <ol className="space-y-2">
              {plan.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border/50 bg-card/30 p-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <code className="mt-0.5 block break-all font-mono text-xs text-primary/90">{s.command}</code>
                    {s.note && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.note}</p>}
                  </div>
                </li>
              ))}
            </ol>

            {plan.notes.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-600 dark:text-amber-300">{L.gpuNote}</p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                  {plan.notes.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              </div>
            )}

            {onAskAi && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => askAi(L.setupPrompt(os, gpu, installer, plan.script))}
              >
                <Bot className="size-4" /> {L.walkMe}
              </Button>
            )}
          </TabsContent>

          {/* ── Diagnose ── */}
          <TabsContent value="diagnose" className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">{L.diagnoseIntro}</p>
            <Textarea
              value={errText}
              onChange={(e) => setErrText(e.target.value)}
              placeholder={L.placeholder}
              className="min-h-24 resize-y font-mono text-xs"
            />
            <Button size="sm" onClick={runDiagnose} disabled={!errText.trim()} className="gap-1.5">
              <Search className="size-4" /> {L.diagnose}
            </Button>

            {hits && hits.length === 0 && (
              <div className="rounded-lg border border-border/60 bg-card/30 p-4 text-center text-sm text-muted-foreground">
                {L.noMatch}
                {onAskAi ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="px-1"
                    onClick={() => askAi(L.diagnosePrompt(errText))}
                  >
                    {L.askAi}
                  </Button>
                ) : (
                  L.tryOther
                )}
              </div>
            )}

            {hits?.map(({ key, result }) => (
              <div key={key} className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-mono text-sm font-medium text-destructive">{result.error}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{L.cause}</span> {result.cause}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{L.solution}</span> {result.solution}
                </p>
                {result.command && <CodeBlock code={result.command} language="bash" />}
                <p className="flex items-start gap-1 text-xs text-primary">
                  <ArrowRight className="mt-0.5 size-3 shrink-0" /> {result.nextStep}
                </p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
