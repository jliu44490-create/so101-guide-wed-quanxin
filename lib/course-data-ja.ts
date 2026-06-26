import type { Chapter, DiagnosticResult } from './types'

/**
 * Japanese mirror of course-data.
 * Used by /ja/learn, /ja/diagnose, /ja/assistant routes.
 * Shape kept identical so JP pages can swap the import.
 */

export const chaptersJa: Chapter[] = [
  {
    id: 1,
    title: '模倣学習とは何か',
    titleEn: 'What is Imitation Learning',
    description: '模倣学習の基本概念、応用シーン、強化学習との違いを理解します。',
    duration: '15 分',
    status: 'locked',
    progress: 0,
    objectives: [
      '模倣学習の定義と中心的なアイデアを理解する',
      'ロボティクス分野での模倣学習の応用を把握する',
      '模倣学習と強化学習の違いを整理する'
    ],
    principles: [
      '模倣学習 (Imitation Learning) は、専門家のデモを観察してロボットに行動を学習させる手法です',
      '中心となる考え方：試行錯誤ではなく、デモデータからポリシーを学習する',
      '主な手法には行動クローニング (BC) と逆強化学習 (IRL) があります'
    ],
    steps: [
      { title: '概念の理解', content: '人間の操作を観察することで、ロボットがタスクの実行方法を学びます。' },
      { title: 'データの出所', content: '遠隔操作 (Teleoperation) によってデータを収集します。' },
      { title: 'ポリシー学習', content: 'ニューラルネットワークで状態 - 行動ペアの写像を学習します。' }
    ],
    commands: [],
    checkpoints: [
      '模倣学習の基本原理を説明できる',
      'BC と ACT の違いを理解している',
      '模倣学習がロボットアーム作業に適している理由を理解している'
    ],
    errors: [],

    introduction: `ロボットに「机の上のコップを持ち上げる」ことを教えたいとします。

やり方は大きく2つあります：

1. **「成功」の定義だけを与え**、あとは何万回も試行錯誤させて報酬から少しずつ学ばせる。これが **強化学習 (Reinforcement Learning, RL)** です。
2. **数十回お手本を見せて**、それを真似して学ばせる。これが **模倣学習 (Imitation Learning, IL)** です。

現実の物理世界では1番目はほぼ非現実的です —— ロボットアームを1台壊せば数千ドル、「何万回も試す」のはコストを燃やすのと同じだからです。そのため2020年頃から、ロボティクス分野は特に精密操作（pick-and-place、組み立て、把持）で大規模に模倣学習へ回帰しました。

模倣学習の核となる数学は、実は一言で表せます：

> 大量の **(状態 s, 行動 a)** の人間のデモ対を与え、方策 π(s) → a を学習する。未知の状態でも妥当な行動を出せるようにする。

教師あり学習に似ている？　その通りです —— もっとも素朴な版はそのまま教師あり学習として解き、**行動クローニング (Behavior Cloning, BC)** と呼ばれます。ただし BC には **複合誤差 (compounding error)** という悪名高い問題があります：各ステップの予測がわずかにずれると、次の入力は学習分布からさらに外れ、誤差が雪だるま式に膨らみます。

現代の模倣学習（ACT、Diffusion Policy）の核心的な工夫は、いずれもこの雪だるまを抑えることにあります。本サイトの以降8章で、ACT を SO101 上に実装するまでの道のりを一通り辿ります。`,

    whyItMatters: `なぜ本気で学ぶ価値があるのか？

模倣学習は現在、**100ドル級のハードウェアで現実の操作タスクを動かせると広く実証されている唯一の手法**です。HuggingFace LeRobot チーム、Stanford ALOHA、Tesla Optimus はいずれも類似のフレームワークを使っています。習得すれば：

- 自分で 50〜100 件のデータを集め、特定タスクを動かせる方策を学習できる；
- 同じコードで「タオルをたたむ」「USB を挿す」「扉を開ける」といった異なるタスクに取り組める；
- 2023〜2025 年のトップ会議論文の中核 pipeline の大半を再現できる。`,

    keyTerms: ['模倣学習', '行動クローニング', 'ACT', '遠隔操作', '複合誤差'],

    diagrams: [
      {
        title: '模倣学習の標準 pipeline',
        source: `flowchart LR
    A["人間の専門家"] -->|"N 本の軌跡をデモ"| B["データセット (s, a)"]
    B -->|"教師あり学習"| C["方策 π_theta"]
    C -->|"s -> a"| D["ロボットアーム"]
    D -.->|"新しい状態 s'"| C
    style A fill:#7c5cff,stroke:#7c5cff,color:#fff
    style C fill:#22c55e,stroke:#22c55e,color:#fff
    style D fill:#0ea5e9,stroke:#0ea5e9,color:#fff`,
        caption: '専門家がデモで教師信号を与え、方策は「s を見たら a を出す」写像を学ぶ。ループに注目：ロボットアームが実行すると新しい状態が生まれ、再び方策へ戻る。'
      },
      {
        title: '強化学習 vs 模倣学習：データの出所の比較',
        source: `flowchart TB
    subgraph RL ["強化学習 RL"]
        direction LR
        R1["ランダム行動"] --> R2["環境が報酬 r を返す"]
        R2 --> R3["方策を更新"]
        R3 --> R1
    end
    subgraph IL ["模倣学習 IL"]
        direction LR
        I1["専門家のデモ"] --> I2["データセット (s, a)"]
        I2 --> I3["教師あり学習"]
        I3 --> I4["方策"]
    end`,
        caption: 'RL は「試行錯誤＋報酬」のループに依存し、大量の実環境とのやり取りが必要。IL はデモデータを一度に取り込み、学習の流れは画像分類とほぼ同じ。'
      }
    ],

    walkthrough: [
      {
        title: '状態 s と行動 a を理解する',
        body: `SO101 では、状態 s は6次元ベクトル [θ₁, θ₂, ..., θ₆] で、各 θᵢ は各関節の現在角度です。行動 a も6次元ベクトルですが、「次の時刻に各関節を到達させたい角度」を表します。

つまり1本のデモ軌跡は (s_t, a_t) の連なりで、30 Hz でサンプリングすれば、5秒の操作で 150 対のサンプルになります。

LeRobot の parquet ファイルでは：

- s は \`observation.state\`
- a は \`action\`

データセットを開けば、この2つのフィールドを直接見られます。`,
        tip: '第6章で実際に parquet を開いて確認します。そのとき、この節の内容が一気に具体的になります。'
      },
      {
        title: '方策 π とは何かを理解する',
        body: `方策 π は関数そのものです —— s を入力し、a を出力します。ディープラーニングではこれがニューラルネットワークで、パラメータを θ と呼びます。学習の目的は、π_θ(s) が専門家のデモの a にできるだけ近づくような θ を見つけることです。

もっとも素朴な損失関数は平均二乗誤差 (MSE) です：

\`\`\`
L = ||π_θ(s) - a_expert||²
\`\`\`

この式だけを見れば、模倣学習は画像分類とほとんど同じ —— どちらも「教師信号＋誤差逆伝播」です。違うのは入力の次元と出力の意味だけです。`,
        tip: 'ACT ではこの関数は「1フレーム見て1行動」ではなく「1フレーム見て未来100ステップの行動系列を出す」ものになります。これが Action Chunking の核心で、第7章で扱います。'
      },
      {
        title: 'なぜ BC では不十分かを理解する',
        body: `あなたが運転していて、ハンドルが理想の位置から1度ずれたと想像してください。

次の瞬間に見える映像は、少し左に寄った車線です —— この映像は、学習データの「専門家が正常に運転している」映像とは少し違います。もし方策が「正常運転」の映像しか学んでいなければ、ずれた映像ではさらに悪い予測をします。

その次の瞬間、映像はもっとずれます。さらに進むと、方策は完全に混乱します。

これが **複合誤差 (compounding error)** です：各ステップの小さなずれが積み重なり、入力分布が学習分布からどんどん離れていきます。`,
        warning: 'この問題は長系列タスク（10秒以上）で特に深刻です。ロボットの動作は最初の数秒は滑らかでも、後半ほど歪んでいきます。Action Chunking ＋ Time Ensembling が現状もっとも有効な緩和策で、第7〜8章で扱います。'
      }
    ],

    pitfalls: [
      {
        symptom: '「模倣学習は答えを写すだけで、技術的に大したことはない。」',
        cause: '「模倣」を文字どおりのコピー＆ペーストだと捉えている。',
        fix: '本当の難しさはデータ収集ではなく、方策を **未知の状態へ汎化させる** ことにあります。50件のデモを丸暗記できる方策には価値がありません —— 欲しいのは、環境の揺らぎ（照明変化、物体位置の微妙なずれ、初期姿勢の違い）に対応できる方策です。ここが IL と教師あり画像分類の最大の違いです。'
      },
      {
        symptom: '「10件デモしたのに、モデルが学習してくれない。」',
        cause: 'データ量が大幅に不足し、かつデモ同士が似すぎている（状態空間を十分カバーできていない）。',
        fix: '一般的な目安：単純な pick-and-place なら最低 50 件、複雑なタスク（USB 挿入など）なら 200 件以上。さらに「異なる初期位置／異なる把持角度／失敗してやり直す」デモを意図的に入れ、学習分布を十分に広げます。'
      },
      {
        symptom: '「模倣学習で十分、RL は要らない。」',
        cause: 'IL の能力の限界が見えていない。',
        fix: 'IL の上限は「専門家のデモの水準＋わずかな汎化」です。タスク自体が人間の反応速度を超える必要がある（高速なキャッチ、複雑なプランニング）場合や、人間自身のデモが下手な場合（二足歩行のバランス）は、RL または IL+RL のハイブリッドが本筋です。'
      }
    ],

    exercises: [
      {
        title: '状態/行動の次元を計算する',
        instructions: `SO101 には6つの関節があります。30 Hz で7秒のデモを収集する場合：

1. (s, a) のサンプル対はいくつ得られる？
2. 1対あたりの合計次元（s 次元 + a 次元）は？
3. デモ全体の浮動小数点数の総量は？（float32 換算）`,
        hint: 'サンプル数 = fps × 秒数。1対の次元 = 状態次元 + 行動次元。',
        expectedResult: `1. **210 対**（30 × 7）
2. **12 次元**（6 + 6）
3. **210 × 12 = 2520 個の float32 ≈ 10 KB**

これが、LeRobot データセットが数千件のデモを保存しても数百 MB で済む理由です —— 状態/行動そのものは低次元データで、本当に容量を食うのはカメラの動画フレームです。`
      },
      {
        title: '考察：なぜ模倣学習にカメラが必要なのか？',
        instructions: `SO101 は各関節の角度を正確に読めるのだから、理論上は「状態 s = 関節角度」でロボットアーム自身の姿勢は完全に記述できるはずです。

それでも、なぜ現代の模倣学習アルゴリズム（ACT を含む）はカメラを必須とするのでしょうか？`,
        hint: '「ロボットアームの姿勢」と「環境の状態」の違いを考えてみましょう。',
        expectedResult: `関節角度はロボットアーム **自身** しか記述せず、**タスク環境** の情報を含みません —— コップはどこ？　机に障害物は？　対象物は動かされていないか？

カメラが与えるのは **環境の視覚的な状態** です。カメラが無ければ、方策は「再生機のような」固定の行動系列しか学べず、環境変化に反応できません。

これが、ACT の方策入力が「関節状態 ＋ 1枚または複数枚の画像」の連結である理由です。`
      }
    ],

    selfCheck: [
      {
        question: '行動クローニング (BC) と模倣学習 (IL) は同じもの？',
        answer: '**いいえ。** BC は IL のもっとも素朴な実装の一つです。IL は大きな方向性 —— 「デモから方策を学ぶ」手法はすべて IL で、BC、逆強化学習 (IRL)、ACT、Diffusion Policy などを含みます。BC はそのうち「教師あり学習で (s, a) を直接フィットする」一種にすぎません。'
      },
      {
        question: 'なぜ模倣学習はロボットアームに向くのに、自動運転には向かないのか？',
        answer: `ロボットアームに向く理由：

1. 物理的なやり取りが安全に制御でき、デモのコストが低い
2. タスク空間が比較的閉じていて、デモで大半のケースをカバーできる

自動運転は corner case で純粋な模倣学習がほぼ不可能です —— 「前方に突然子どもが現れる」あらゆる変種をデモするのは無理で、ルールシステム＋シミュレーション RL の併用が必須です。`
      },
      {
        question: 'ACT は BC より何が優れているか？　一言でまとめると。',
        answer: 'ACT は単一ステップではなく連続した行動の塊を一度に予測することで、「複合誤差の蓄積」という問題を「短い塊の中なら誤差を許容できる」という問題に変換している。'
      },
      {
        question: 'デモデータの 10% が失敗（コップを落とすなど）の場合、削除すべき？　残すべき？',
        answer: `一般には **残す＋ラベル付け** を推奨します。

失敗例は「何をすべきでないか」という負の信号を与えます；完全に削除すると、方策は失敗状態に対する事前知識を一切持たず、かえって汎化が悪化します。

ただし比率が高すぎてはいけません。失敗デモが 30% を超えると学習目標を汚染します。`
      }
    ],

    furtherReading: [
      {
        title: 'Imitation Learning: A Survey of Learning Methods (Hussein et al. 2017)',
        url: 'https://arxiv.org/abs/1709.07820',
        note: 'IL 分野の定番サーベイ。ざっと目を通すと全体像がつかめる。'
      },
      {
        title: 'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (Zhao et al. 2023)',
        url: 'https://arxiv.org/abs/2304.13705',
        note: 'ACT の原論文。最初は数式を全部理解しなくてよい。実験動画と手法概要を見るだけで十分。'
      },
      {
        title: 'LeRobot 公式紹介ブログ',
        url: 'https://huggingface.co/blog/lerobot',
        note: 'HuggingFace チームによる LeRobot のプロダクト紹介。以降8章のコード理解に役立つ。'
      }
    ],

    summary: `**模倣学習 = 専門家のデモから方策を学ぶこと。** もっとも素朴な手法は BC（教師あり学習で (s, a) 対をフィット）だが、複合誤差の問題がある。ACT は「一度に行動の塊を予測する」ことでそれを緩和した。

SO101 では状態は6次元の関節角度、行動は6次元の目標角度、さらにカメラフレーム。

次章では SO101 のハードウェアを開け、Leader/Follower がどのようにこれらの (s, a) 対を生み出すかを見ていく。`
  },
  {
    id: 2,
    title: 'SO101 ハードウェアと Leader / Follower 構成',
    titleEn: 'SO101 Hardware & Leader/Follower',
    description: 'SO101 ロボットアームのハードウェア構成、シリアル接続、Leader-Follower の動作モードを学びます。',
    duration: '20 分',
    status: 'locked',
    progress: 0,
    objectives: [
      'SO101 ロボットアームのハードウェア構成を理解する',
      'Leader-Follower 双腕協調モードを把握する',
      'シリアルポートの接続・識別方法を習得する'
    ],
    principles: [
      'SO101 は低コストな 6 自由度ロボットアームで、模倣学習研究に適しています',
      'Leader アームを人が操作し、Follower アームがリアルタイムで追従します',
      'USB シリアル経由で PC と通信し、各モータは独立した ID を持ちます'
    ],
    steps: [
      { title: 'ハードウェア確認', content: '各関節モータの動作と配線の固定状態を確認します。' },
      { title: 'シリアルポート識別', content: '`ls /dev/tty*` で利用可能なシリアル機器を確認します。' },
      { title: '双腕設定', content: 'Leader / Follower それぞれのポートを設定します。' }
    ],
    commands: [
      { description: 'シリアル機器を表示', code: 'ls /dev/tty*' },
      { description: 'USB 機器の情報を表示', code: 'lsusb' },
      { description: 'シリアル接続の詳細を確認', code: 'dmesg | grep tty' }
    ],
    checkpoints: [
      'Leader と Follower のシリアルポートを識別できる',
      '双腕協調の動作原理を理解している',
      'ハードウェア接続の確認を完了している'
    ],
    errors: [
      {
        error: 'Permission denied: /dev/ttyUSB0',
        cause: '現在のユーザーにシリアルポートのアクセス権がありません。',
        solution: 'ユーザーを dialout グループに追加します。',
        command: 'sudo usermod -a -G dialout $USER'
      }
    ]
  },
  {
    id: 3,
    title: 'LeRobot 環境構築',
    titleEn: 'LeRobot Environment Setup',
    description: 'Python 環境、依存パッケージ、CUDA を含む LeRobot フレームワークをインストールします。',
    duration: '30 分',
    status: 'locked',
    progress: 0,
    objectives: [
      'Python 仮想環境を作成・有効化する',
      'LeRobot と依存パッケージをインストールする',
      'CUDA と PyTorch を構成する'
    ],
    principles: [
      'LeRobot は Hugging Face が開発するロボット学習フレームワークです',
      '多様なロボットアームと模倣学習アルゴリズムに対応しています',
      'Python 3.10+ と CUDA 環境が必要です'
    ],
    steps: [
      { title: '環境作成', content: 'conda または venv で独立した Python 環境を作成します。' },
      { title: 'リポジトリのクローン', content: 'GitHub から LeRobot のソースを取得します。' },
      { title: '依存のインストール', content: 'pip で必要なパッケージをまとめてインストールします。' },
      { title: 'インストール検証', content: 'テストスクリプトでインストール成功を確認します。' }
    ],
    commands: [
      { description: 'conda 環境を作成', code: 'conda create -n lerobot python=3.10 -y' },
      { description: '環境を有効化', code: 'conda activate lerobot' },
      { description: 'LeRobot をクローン', code: 'git clone https://github.com/huggingface/lerobot.git' },
      { description: '依存をインストール', code: 'cd lerobot && pip install -e .' },
      { description: 'PyTorch / CUDA を検証', code: 'python -c "import torch; print(torch.cuda.is_available())"' }
    ],
    checkpoints: [
      'conda 環境を正常に作成できた',
      'LeRobot のインストールでエラーが出ない',
      'PyTorch が CUDA を検出できる'
    ],
    errors: [
      {
        error: 'CUDA out of memory',
        cause: 'GPU の VRAM が不足しています。',
        solution: 'batch_size を縮小するか勾配累積を有効にします。',
        command: 'export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512'
      },
      {
        error: 'ModuleNotFoundError: No module named lerobot',
        cause: 'LeRobot のインストール失敗、または環境が有効化されていません。',
        solution: '正しい conda 環境を有効化したうえで再インストールします。',
        command: 'conda activate lerobot && pip install -e .'
      }
    ]
  },
  {
    id: 4,
    title: 'ポート識別とロボットアームのキャリブレーション',
    titleEn: 'Port Detection & Calibration',
    description: 'ロボットアームのポートを識別し、モータのキャリブレーションを行って動作精度を確保します。',
    duration: '25 分',
    status: 'locked',
    progress: 0,
    objectives: [
      'Leader / Follower のポートを正確に識別する',
      'ロボットアームの零点キャリブレーションを完了する',
      'キャリブレーション結果の精度を検証する'
    ],
    principles: [
      'キャリブレーションによってモータ角度と実位置を一致させます',
      'キャリブレーションデータは設定ファイルに保存されます',
      'モータ交換や再組立て後はその都度キャリブレーションが必要です'
    ],
    steps: [
      { title: 'ポート設定', content: '設定ファイルに Leader / Follower のシリアルパスを指定します。' },
      { title: '零点設定', content: 'ロボットアームを初期姿勢に移動して記録します。' },
      { title: 'キャリブレーション検証', content: '各関節の可動範囲が正しいかテストします。' }
    ],
    commands: [
      { description: 'キャリブレーションスクリプトを実行', code: 'lerobot-calibrate --robot.type=so101_follower --robot.port=/dev/ttyACM0 --robot.id=so101_follower' },
      { description: 'キャリブレーション結果を確認', code: 'find ~/.cache/huggingface/lerobot/calibration -maxdepth 3 -type f' }
    ],
    checkpoints: [
      'ポートを正しく識別できている',
      'キャリブレーションデータが保存されている',
      '関節可動範囲が正常',
    ],
    errors: [
      {
        error: 'Missing required field(s) port',
        cause: 'コマンド内でポートが指定されていません。',
        solution: '--robot.port=/dev/ttyACM0 を追加し、実際のポートは ls /dev/tty* で確認します。',
        command: 'lerobot-calibrate --help'
      }
    ]
  },
  {
    id: 5,
    title: '遠隔操作とデータ収集',
    titleEn: 'Teleoperation & Data Collection',
    description: 'Leader アームで Follower アームを遠隔操作し、学習データセットを収集します。',
    duration: '40 分',
    status: 'locked',
    progress: 0,
    objectives: [
      '遠隔操作の基本フローを習得する',
      'データ収集のパラメータ設定を理解する',
      '一連のデータ収集タスクを完了させる'
    ],
    principles: [
      '遠隔操作では Leader の関節位置を読み取り Follower を制御します',
      'データには関節角度、画像、タイムスタンプが含まれます',
      'データ品質はモデル学習の成果に直結します'
    ],
    steps: [
      { title: '遠隔操作の起動', content: 'スクリプトを起動し Leader-Follower の接続を確立します。' },
      { title: 'タスクのデモ', content: 'Leader を使って目標タスクを複数回実演します。' },
      { title: 'データの保存', content: '指定ディレクトリに正しく保存されたか確認します。' }
    ],
    commands: [
      { description: '遠隔操作を起動', code: 'lerobot-teleoperate --robot.type=so101_follower --robot.port=/dev/ttyACM0 --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 --display_data=true' },
      { description: 'データセットを録画', code: 'lerobot-record --robot.type=so101_follower --robot.port=/dev/ttyACM0 --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 --dataset.repo_id=your-name/so101-task --dataset.num_episodes=50 --dataset.fps=30 --display_data=true' }
    ],
    checkpoints: [
      'Leader-Follower の同期が正常',
      'データファイルが正しく生成されている',
      '画像フレームレートが安定している'
    ],
    errors: []
  },
  {
    id: 6,
    title: 'データセット構造と meta/info.json',
    titleEn: 'Dataset Structure & Metadata',
    description: 'LeRobot データセットのフォーマット、ディレクトリ構造、メタデータファイルを理解します。',
    duration: '20 分',
    status: 'locked',
    progress: 0,
    objectives: [
      'LeRobot データセットのディレクトリ構造を理解する',
      'meta/info.json の役割を押さえる',
      'データセットの不整合を診断・修正できるようになる'
    ],
    principles: [
      'データセットは parquet ファイルと動画から構成されます',
      'meta/info.json にデータセットのメタ情報が格納されます',
      '正しいフォーマットが学習成功の前提条件です'
    ],
    steps: [
      { title: 'ディレクトリ構造', content: 'data/、meta/、videos/ などの役割を把握します。' },
      { title: 'メタデータ確認', content: 'info.json の中身が想定通りか確認します。' },
      { title: 'データ検証', content: 'ツールを使ってデータセットの完整性を検証します。' }
    ],
    commands: [
      { description: 'データセット構造を確認', code: 'tree ~/.cache/huggingface/lerobot/your-name/so101-task' },
      { description: 'メタデータを表示', code: 'cat ~/.cache/huggingface/lerobot/your-name/so101-task/meta/info.json' },
      { description: 'データセットを検証', code: 'python -c "from lerobot.common.datasets.lerobot_dataset import LeRobotDataset; ds = LeRobotDataset(\'your-name/so101-task\')"' }
    ],
    checkpoints: [
      'ディレクトリ構造を理解している',
      'info.json の内容が正しい',
      'データセットを読み込んでもエラーが出ない'
    ],
    errors: [
      {
        error: 'FileNotFoundError: meta/info.json',
        cause: 'データセットのメタデータファイルが存在しません。',
        solution: 'データセットディレクトリの完整性を確認します。欠損している場合は再収集が必要です。',
        command: 'ls -la ~/.cache/huggingface/lerobot/your-name/so101-task/meta/'
      }
    ]
  },
  {
    id: 7,
    title: 'ACT モデルの学習',
    titleEn: 'ACT Model Training',
    description: 'ACT (Action Chunking Transformer) モデルを構成し、学習を実行します。',
    duration: '45 分',
    status: 'locked',
    progress: 0,
    objectives: [
      'ACT モデルのアーキテクチャと利点を理解する',
      '学習ハイパーパラメータを設定する',
      '学習を完了させ進捗を監視する'
    ],
    principles: [
      'ACT は Transformer を用いて行動シーケンスを予測します',
      'Action Chunking は時系列の一貫性を高めます',
      'CVAE 構造はポリシーの多様性を強化します'
    ],
    steps: [
      { title: '設定の確認', content: '学習設定ファイルのパラメータが正しいか確認します。' },
      { title: '学習の開始', content: '学習スクリプトを起動して loss の推移を監視します。' },
      { title: 'モデルの保存', content: 'デプロイに向けてベストなチェックポイントを保存します。' }
    ],
    commands: [
      { description: 'ACT 学習を起動', code: 'lerobot-train --dataset.repo_id=your-name/so101-task --policy.type=act --output_dir=outputs/train/act_so101' },
      { description: 'wandb で監視', code: 'wandb login && lerobot-train --dataset.repo_id=your-name/so101-task --policy.type=act --wandb.enable=true --output_dir=outputs/train/act_so101' },
      { description: '学習を再開', code: 'lerobot-train --config_path=outputs/train/act_so101/checkpoints/last/pretrained_model/train_config.json --resume=true' }
    ],
    checkpoints: [
      '学習を起動してもエラーが出ない',
      'Loss が継続的に下がっている',
      'チェックポイントが正常に保存されている'
    ],
    errors: [
      {
        error: 'CUDA out of memory',
        cause: '現在の batch_size に対し GPU VRAM が不足しています。',
        solution: 'batch_size を縮小するか勾配累積を有効にします。',
        command: 'lerobot-train --dataset.repo_id=your-name/so101-pick-cup --policy.type=act --batch_size=8'
      }
    ]
  },
  {
    id: 8,
    title: 'モデル推論と実機デプロイ',
    titleEn: 'Inference & Deployment',
    description: '学習済みモデルをロードし、実機ロボットアーム上で推論・デプロイを行います。',
    duration: '35 分',
    status: 'locked',
    progress: 0,
    objectives: [
      '学習済みのチェックポイントをロードする',
      '推論パラメータを設定する',
      '実機ロボットアームでポリシーを実行する'
    ],
    principles: [
      '推論時は学習時と一致した観測空間を維持します',
      'リアルタイム制御では遅延と安定性に注意します',
      '安全装置でロボットアームの暴走を防ぎます'
    ],
    steps: [
      { title: 'モデルのロード', content: 'チェックポイントのパスを指定して学習済みモデルを読み込みます。' },
      { title: '推論テスト', content: 'シミュレーションや簡単なタスクで動作確認します。' },
      { title: '実機デプロイ', content: '実機と接続し、ポリシーを稼働させます。' }
    ],
    commands: [
      { description: '推論を実行', code: 'lerobot-record \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --dataset.repo_id=your-name/so101-eval \
  --dataset.num_episodes=5 --dataset.fps=30 \
  --policy.path=outputs/train/act_so101/checkpoints/last/pretrained_model \
  --display_data=true' },
      { description: 'データセットを可視化', code: 'lerobot-dataset-viz --repo-id your-name/so101-task' }
    ],
    checkpoints: [
      'モデルが正常にロードされる',
      '推論 fps が安定している',
      'ロボットアームの動作が滑らか'
    ],
    errors: [
      {
        error: 'ロボットアームが推論時に振動する',
        cause: '制御周波数が不安定、もしくはモデル出力にノイズが多い。',
        solution: 'fps 設定を確認し、必要に応じてスムージングフィルタを追加します。'
      }
    ]
  },
  {
    id: 9,
    title: '頻出エラーとデバッグ手法',
    titleEn: 'Troubleshooting & Debugging',
    description: 'よく発生する問題の診断と解決方法を整理します。',
    duration: '20 分',
    status: 'locked',
    progress: 0,
    objectives: [
      '頻出エラーの診断手順を身につける',
      'ログから問題を特定する方法を学ぶ',
      'デバッグ経験を蓄積する'
    ],
    principles: [
      'エラーメッセージは最良のデバッグ起点です',
      '体系的な切り分けはランダムな試行錯誤に勝ります',
      '問題と解決策を記録すると再利用が容易になります'
    ],
    steps: [
      { title: 'エラー分類', content: '環境・ハードウェア・データ・学習などタイプ別に整理します。' },
      { title: 'ログ分析', content: 'ログから重要なエラー情報を抽出する方法を学びます。' },
      { title: '解決策の検証', content: '対処を適用し、問題が解消されたか確認します。' }
    ],
    commands: [
      { description: '完整なエラースタックを表示', code: 'python script.py 2>&1 | tee error.log' },
      { description: 'GPU の状態を確認', code: 'nvidia-smi' },
      { description: 'ディスク残容量を確認', code: 'df -h' }
    ],
    checkpoints: [
      '頻出エラーを単独で診断できる',
      '個人用のエラー知識ベースを作っている',
      'デバッグの体系的な進め方を理解している'
    ],
    errors: []
  }
]

export const errorDatabaseJa: Record<string, DiagnosticResult> = {
  'missing required field(s) port': {
    error: 'Missing required field(s) port',
    cause:
      'コマンドに --robot.port が無いか、指定したシリアルポートが実機と一致していません。',
    solution: 'ls /dev/tty* で実際のポートを確認し、--robot.port=/dev/ttyACM0 を追加します。遠隔操作や録画では --teleop.port=/dev/ttyACM1 も指定します。',
    command:
      'lerobot-calibrate --robot.type=so101_follower --robot.port=/dev/ttyACM0 --robot.id=so101_follower',
    nextStep: '`ls /dev/tty*` でシリアル機器を確認し、実際のポートをコマンド引数に入れてください。',
    category: 'hardware',
    related: ['permission denied', 'serial port not found']
  },
  'filenotfounderror meta/info.json': {
    error: 'FileNotFoundError: meta/info.json',
    cause:
      'データセットのディレクトリ構造が不完整で、必要なメタデータファイルが見つかりません。データ収集の中断やパス誤りが原因として考えられます。',
    solution:
      'データセットディレクトリの存在と、meta フォルダおよびその中身を確認します。完全に欠損している場合はデータの再収集が必要です。',
    command: 'ls -la ~/.cache/huggingface/lerobot/your-repo-id/meta/',
    nextStep: 'ディレクトリが空、あるいは存在しない場合はデータ収集スクリプトを再実行してください。',
    category: 'data',
    related: ['dataset not found', 'parquet read error']
  },
  'cuda out of memory': {
    error: 'CUDA out of memory',
    cause:
      'GPU の VRAM が不足し、学習に必要なメモリを確保できません。多くは batch_size が大きすぎる、もしくはモデル自体が大きい場合です。',
    solution: 'batch_size を縮小する、勾配累積を有効にする、混合精度 (AMP) を活用します。',
    command:
      'lerobot-train --dataset.repo_id=your-name/so101-pick-cup --policy.type=act --batch_size=4',
    nextStep: '`nvidia-smi` で VRAM 使用量を観測しつつ、段階的にパラメータを調整します。',
    category: 'training',
    related: ['training too slow', 'nan loss']
  },
  'permission denied': {
    error: 'Permission denied: /dev/ttyUSB*',
    cause: '現在のユーザーにシリアル機器へのアクセス権がありません。',
    solution: 'ユーザーを dialout グループに追加し、再ログインします。',
    command: 'sudo usermod -a -G dialout $USER',
    nextStep: '再ログイン、あるいは `newgrp dialout` で一時的にグループを切り替えて反映させます。',
    category: 'hardware',
    related: ['missing required field(s) port']
  },
  modulenotfounderror: {
    error: 'ModuleNotFoundError: No module named ...',
    cause: '必要な Python パッケージが不足している、もしくは仮想環境が有効化されていません。',
    solution: '対象の conda / venv 環境を有効化したうえで欠損パッケージをインストールします。',
    command: 'conda activate lerobot && pip install -e .',
    nextStep: '`pip list` でインストール済みパッケージを確認してください。',
    category: 'environment',
    related: ['importerror', 'pip install fail']
  },
  'ロボットアーム振動': {
    error: 'ロボットアームが推論時に振動する',
    cause: '制御周波数の不安定、ネットワーク遅延、モデル出力のノイズが原因と考えられます。',
    solution: '1. fps を固定する  \n2. EMA フィルタで動作を平滑化する  \n3. USB 接続の安定性を確保する',
    command: 'lerobot-record --robot.type=so101_follower --robot.port=/dev/ttyACM0 --dataset.fps=30 --policy.path=outputs/.../pretrained_model',
    nextStep: '制御周波数を下げるか、EMA 平滑化を導入して挙動を確認してください。',
    category: 'inference',
    related: ['inference latency high']
  },
  'nan loss': {
    error: 'Training loss becomes NaN',
    cause:
      '学習率が過大、データに外れ値や正規化の不備があり、勾配が爆発している可能性があります。',
    solution: '1. 学習率を下げる  \n2. 勾配クリッピングを有効化する  \n3. データセットに NaN や極端値がないか確認する',
    command:
      'lerobot-train --dataset.repo_id=your-name/so101-pick-cup --policy.type=act --optimizer.lr=1e-5 --optimizer.grad_clip_norm=10',
    nextStep: 'wandb / tensorboard で勾配ノルムを監視し、異常 batch を特定します。',
    category: 'training',
    related: ['cuda out of memory']
  },
  'training too slow': {
    error: '学習速度が遅すぎる',
    cause:
      'データロードのボトルネック、batch_size 不足、混合精度未使用、GPU 利用率の低さなどが考えられます。',
    solution:
      '1. num_workers を増やす  \n2. AMP 混合精度を有効化する  \n3. batch_size を適切に引き上げる  \n4. GPU 利用率を確認する',
    command:
      'lerobot-train --dataset.repo_id=your-name/so101-pick-cup --policy.type=act --num_workers=8',
    nextStep: '`nvidia-smi dmon` で GPU 利用率と消費電力を監視します。',
    category: 'training'
  },
  'serial port not found': {
    error: '/dev/ttyUSB0 が存在しない',
    cause: 'ロボットアームが未接続、USB ケーブルの不良、もしくはドライバが未ロードです。',
    solution: '1. USB ケーブルを物理的に確認  \n2. `dmesg | tail` で接続情報を確認  \n3. USB を抜き差しする',
    command: 'dmesg | tail -n 20',
    nextStep: 'それでも ttyUSB が現れない場合は、USB ケーブルの交換または CH340 ドライバの導入を検討してください。',
    category: 'hardware'
  },
  'leader follower mismatch': {
    error: 'Leader と Follower の関節角差が大きい',
    cause: 'キャリブレーション未実施、もしくはモータ零点が一致していません。',
    solution: 'キャリブレーションスクリプトを再実行し、両アームを同一姿勢で零点記録します。',
    command:
      'lerobot-calibrate --robot.type=so101_follower --robot.port=/dev/ttyACM0 --robot.id=so101_follower',
    nextStep: 'キャリブレーション後に遠隔操作を再実行し、追従性を観察してください。',
    category: 'hardware'
  },
  'inference latency high': {
    error: '推論 fps が不安定 / 遅延が大きい',
    cause: 'CPU と GPU の間のデータ転送、もしくは画像エンコードがボトルネックです。',
    solution: '1. カメラ解像度を下げる  \n2. 半精度推論を使う  \n3. 不要なバックグラウンドプロセスを停止する',
    command: 'lerobot-record --robot.type=so101_follower --robot.port=/dev/ttyACM0 --dataset.fps=30 --policy.device=cuda',
    nextStep: '推論ループに `time.perf_counter()` を入れて時間のかかる区間を特定してください。',
    category: 'inference'
  },
  'wandb login fail': {
    error: 'wandb: ERROR Authentication required',
    cause: 'wandb にログインしていない、もしくは API key が失効しています。',
    solution: 'wandb にログインしてトークンを再発行します。',
    command: 'wandb login',
    nextStep: 'CI で自動ログインさせる場合は API key を ~/.netrc に書いておきます。',
    category: 'environment'
  },
  'video codec error': {
    error: 'OpenCV が動画ファイルをデコードできない',
    cause: 'ffmpeg や該当コーデックが不足している、もしくは動画フォーマットが未対応です。',
    solution: 'システムに ffmpeg を導入し、opencv を再インストールします。',
    command:
      'sudo apt install -y ffmpeg && pip install opencv-python-headless --force-reinstall',
    nextStep: '`ffprobe` で動画のメタ情報を確認すると原因切り分けが進みます。',
    category: 'data'
  }
}

export const aiResponsesJa: Record<string, string> = {
  'so101 キャリブレーション': `SO101 ロボットアームのキャリブレーション手順：

1. **事前準備**
   - ロボットアームが PC に正しく接続されていることを確認
   - LeRobot 環境を有効化

2. **キャリブレーションスクリプトの実行**
\`\`\`bash
lerobot-calibrate \
  --robot.type=so101_follower \
  --robot.port=/dev/ttyACM0 \
  --robot.id=so101_follower
\`\`\`

3. **キャリブレーションの流れ**
   - 指示に従ってアームを指定姿勢に移動
   - 各関節の零点を順番にキャリブレーション
   - キャリブレーションデータは自動保存されます

4. **キャリブレーションの検証**
   - 遠隔操作で可動範囲をテスト
   - 関節角度の表示が正しいことを確認`,

  'act bc 比較': `**ACT vs BC 比較**

| 特性 | BC (Behavior Cloning) | ACT (Action Chunking Transformer) |
|------|----------------------|-----------------------------------|
| 出力 | 単一ステップの行動 | 行動シーケンス (chunk) |
| アーキテクチャ | シンプルな MLP/CNN | Transformer + CVAE |
| 時系列モデリング | 弱 | 強 |
| マルチモーダル | 非対応 | 対応 |

**ACT の利点：**
1. **Action Chunking**: 複数ステップを一度に予測し、時系列の一貫性を確保
2. **CVAE 構造**: デモのマルチモーダル性に対応
3. **Transformer**: 長系列依存関係のモデリングに強い

**使い分けの目安：**
- シンプルなタスクや素早い検証 → BC
- 複雑なタスク・高精度要求 → ACT`,

  'データ収集コマンド': `**LeRobot データ収集コマンド：**

\`\`\`bash
# 基本のデータ収集
lerobot-record \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \
  --dataset.repo_id=your-name/task-name \
  --dataset.num_episodes=50 --dataset.fps=30 \
  --display_data=true

# カメラ付きのデータ収集
lerobot-record \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \
  --dataset.repo_id=your-name/task-name \
  --dataset.num_episodes=50 --dataset.fps=30 \
  --display_data=true

# HuggingFace Hub にプッシュ
lerobot-record \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \
  --dataset.repo_id=your-name/task-name \
  --dataset.num_episodes=50 --dataset.fps=30 \
  --dataset.push_to_hub=true \
  --display_data=true
\`\`\`

**パラメータの説明：**
- \`--dataset.num_episodes\`: 収集するエピソード数
- \`--dataset.fps\`: 制御・録画のフレームレート
- \`--dataset.push_to_hub\`: Hub にアップロードするかどうか`,

  'meta/info.json': `**meta/info.json 関連のエラーについて：**

このエラーは LeRobot がデータセットのメタデータファイルを見つけられないことを意味します。

**よくある原因：**
1. データセットパスが誤っている
2. データ収集が中断され、ファイルが完整に生成されていない
3. ディレクトリ構造が壊れている

**対処手順：**

1. データセットディレクトリを確認：
\`\`\`bash
ls -la ~/.cache/huggingface/lerobot/your-repo-id/
\`\`\`

2. meta ディレクトリを確認：
\`\`\`bash
ls -la ~/.cache/huggingface/lerobot/your-repo-id/meta/
\`\`\`

3. ディレクトリが空の場合は、データの再収集が必要です。

**正しいディレクトリ構造：**
\`\`\`
your-repo-id/
├── data/
│   └── chunk-000/
├── meta/
│   ├── info.json
│   ├── episodes.jsonl
│   └── stats.json
└── videos/
\`\`\``,

  'ロボットアーム振動': `**ロボットアームが推論時に振動する場合の対処：**

**原因の整理：**
1. 制御周波数の不安定
2. モデル出力のノイズが大きい
3. USB 通信の遅延
4. モータ PID パラメータが不適切

**対策：**

1. **制御周波数を固定する**
\`\`\`bash
lerobot-record \\
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\
  --dataset.repo_id=your-name/so101-eval \\
  --dataset.num_episodes=5 --dataset.fps=30 \\
  --policy.path=your-checkpoint \\
  --display_data=true
\`\`\`

2. **動作の平滑化を導入する**
推論コード内で EMA フィルタを追加：
\`\`\`python
smoothed_action = 0.7 * action + 0.3 * prev_action
\`\`\`

3. **ハードウェア接続を確認**
   - 高品質な USB ケーブルを使う
   - 電源の安定を確保する

4. **モータパラメータの調整**
   - P ゲインを下げると振動が抑えられます
   - D ゲインを上げると減衰特性が改善します`
}

export const learningPathJa = [
  { icon: 'Settings', title: '環境構築', description: 'Python 環境と LeRobot のインストール' },
  { icon: 'Cpu', title: 'ロボットアーム調整', description: 'ハードウェア接続と零点キャリブレーション' },
  { icon: 'Database', title: 'データ収集', description: '遠隔操作と録画' },
  { icon: 'Brain', title: 'ACT 学習', description: '模倣学習モデルの学習' },
  { icon: 'Rocket', title: 'モデルデプロイ', description: '実機ロボットアームでの推論' },
  { icon: 'HelpCircle', title: 'よくある問題', description: 'エラー診断と解決方法' }
]
