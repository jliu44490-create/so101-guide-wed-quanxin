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
    ],

    introduction: `注文したロボットアームが届き、箱を開けると —— 中には**まったく同じアームが2本**入っています。1本ではありません。

最初は戸惑う人が多いです：なぜ2本？　どっちがどっち？

答えは SO101 の核となる設計にあります：**1本は手で操作する用（Leader / 主腕）、もう1本はあなたの動きをリアルタイムでコピーする用（Follower / 従腕）**。あなたが Leader を持って「コップの持ち方」を実演すると、PC は Follower を同じように動かして結果を見せつつ、Leader の各瞬間の関節角度を記録します —— この記録が第1章で言った (s, a) のデモデータです。

この章ではハードウェアを徹底的に理解します：6つの関節とは何か、2本のアームをどう PC につなぐか、システム上でどう見分けるか、そして誰もが最初にぶつかる権限エラーの直し方。`,

    whyItMatters: `**ハードウェアが分からないと、以降の各ステップで詰まります。**

- どっちが Leader でどっちが Follower か分からない → 第4章のポート設定で混乱する
- 「役割は配線で決まる」を理解していない → 再起動でシリアル順が変わると慌てる
- \`Permission denied\` を直せない → 8割の人が初接続でここに詰まる

この章は純粋なハードウェア理解で、**実機が無くても読み進められます**。届いたらすぐ着手できます。`,

    keyTerms: ['Leader / Follower', '遠隔操作', 'SO101 / SO-ARM100', 'キャリブレーション'],

    diagrams: [
      {
        title: 'Leader → PC → Follower のデータ経路',
        source: `flowchart LR
    H["👋 あなたの手"] -->|"関節を動かす"| L["🦾 Leader 主腕"]
    L -->|"USB で関節角を読む"| PC["💻 PC"]
    PC -->|"USB で指令を送る"| F["🦾 Follower 従腕"]
    PC -->|"同期して記録"| D["📦 データセット (s, a)"]
    style L fill:#7c5cff,stroke:#7c5cff,color:#fff
    style F fill:#0ea5e9,stroke:#0ea5e9,color:#fff
    style PC fill:#22c55e,stroke:#22c55e,color:#fff`,
        caption: 'Leader を動かす → PC が関節角を読む → 同時に Follower で再現＋角度をデータセットに書き込む。30 fps で回り続ける。'
      }
    ],

    walkthrough: [
      {
        title: '6自由度を理解する',
        body: `SO101 の1本のアームには **6つの関節** があり、各関節に1つのモータが付き、独立して回転します：土台の回転、肩、肘、手首の2自由度、グリッパの開閉。

6自由度は産業用ロボットアームの標準構成で、末端（グリッパ）を三次元空間の **任意の位置**（x/y/z）＋ **任意の姿勢**（ピッチ/ヨー/ロール）に到達させるのに十分です。

これが、第1章で状態 s を6次元とした理由でもあります：1関節が1次元の角度値を担います。`,
        tip: '2本のアームはハードウェア的に完全に同じなので、合わせた状態/行動の次元は 6 + 6 = 12 次元です。'
      },
      {
        title: '2本のアームを PC につなぎ、シリアルを見分ける',
        body: `ロボットアームは USB-シリアル変換で PC に接続します。Linux / macOS では、各アームは \`/dev/ttyUSB0\` のような名前のデバイスファイルになります。

もっとも確実な見分け方は「1本抜いてどれが消えるか」です：まず一覧を見て、Leader の USB を抜き、もう一度見る。減った方が Leader です。`,
        command: {
          description: 'すべてのシリアルデバイスを一覧表示',
          code: 'ls /dev/tty*'
        },
        expectedOutput: '/dev/tty   /dev/ttyS0   /dev/ttyUSB0   /dev/ttyUSB1',
        tip: '\`ttyUSB0\` / \`ttyUSB1\` があなたの2本のアーム。\`ttyS0\`、\`tty\` はシステム標準なので無視。'
      },
      {
        title: '「役割は出荷時ではなく設定で決まる」を理解する',
        body: `2本のアームは出荷時まったく同じで、「私は Leader」というラベルは貼られていません。**どちらが Leader でどちらが Follower かは、設定ファイルでどのポートをどの役割に書くかで決まります**（第4章で行います）。

なので覚えるのは1つだけ：挿したらどの ttyUSB がどのアームかを見分け、あとはソフト側で指定するだけ。`,
        warning: 'PC を再起動したり挿し直したりすると、ttyUSB0 / ttyUSB1 の番号が入れ替わることがあります —— Linux シリアルの古くからの問題です。起動のたびに「1本抜く」法で確認するか、udev ルールで固定します（上級トピック）。'
      }
    ],

    pitfalls: [
      {
        symptom: '「2本とも同じ見た目。買い間違えた／1本多く届いた？」',
        cause: 'SO101 がもともと双腕の主従設計だと知らない。',
        fix: '間違いではありません。2本はセットで協調動作します：Leader を人が操作し、Follower が再現する。これがまさにデモデータの集め方です。'
      },
      {
        symptom: 'アームをつなぐと \`Permission denied: /dev/ttyUSB0\` が出る。',
        cause: 'アカウントがシリアルにアクセスできるグループ（Ubuntu の dialout / Arch の uucp）に入っていない。',
        fix: '\`sudo usermod -a -G dialout $USER\` を実行し、**ログアウトして再ログイン**（または再起動）。ほぼ全員が一度はぶつかる落とし穴です。'
      },
      {
        symptom: '\`ls /dev/tty*\` で ttyUSB がまったく見えない。',
        cause: 'USB ケーブルが充電専用でデータ非対応、または CH340 シリアルドライバが無い。',
        fix: '**データ対応**の USB ケーブルに替える；\`dmesg | tail\` で挿入時に認識情報が出るか確認；必要なら CH340 ドライバを導入。'
      }
    ],

    exercises: [
      {
        title: 'Leader と Follower を見分ける',
        instructions: `2本の USB を挿した状態で：

1. \`ls /dev/tty*\` を実行し、どの ttyUSB が出たか記録する
2. そのうち1本（Leader にする予定の方）の USB を抜く
3. もう一度 \`ls /dev/tty*\` を実行する

消えた ttyUSB はどのアームを表す？`,
        hint: '消えたもの = いま抜いたアーム。',
        expectedResult: '消えた ttyUSB の番号が、抜いたアームに対応します。メモしておきましょう —— 第4章で yaml を設定するとき、leader_arms の port にこれを入れます。'
      },
      {
        title: 'データ次元を計算する',
        instructions: '2本の SO101 アームが協調し、各アーム6関節。1フレームの「状態＋行動」は合計で何次元？',
        hint: '(状態次元 + 行動次元)。action を生むのは Leader だけ、Follower/状態は 6 次元であることに注意。',
        expectedResult: '一般的な構成では：observation.state = 6 次元（Follower の現在角度）、action = 6 次元（目標角度）、合計 **12 次元**。両腕の状態を記録する構成ならさらに増える —— タスク設定次第。'
      }
    ],

    selfCheck: [
      {
        question: '目の前の同じ見た目の2本のうち、どちらが Leader か判別するには？',
        answer: 'ハードウェアでは判別できません —— 出荷時は同一です。**ソフト設定**で決まります：どちらをどの USB につなぎ、yaml でそのポートを leader と書いたか。物理的には「1本抜いてどの ttyUSB が消えるか」でポートを特定できます。'
      },
      {
        question: '\`Permission denied: /dev/ttyUSB0\` はハードウェアの故障？',
        answer: 'いいえ。権限の問題です —— アカウントが dialout グループに入っていません。\`sudo usermod -a -G dialout $USER\` 後に再ログインすれば解決。アーム自体は正常です。'
      },
      {
        question: 'なぜ状態ベクトルは6次元なのか？',
        answer: '1本の SO101 アームには6つの関節があり、各関節に1つの角度値があるため、6関節 = 6次元です。6自由度は末端を三次元空間の任意位置＋任意姿勢に到達させるのに十分です。'
      }
    ],

    furtherReading: [
      {
        title: 'SO-ARM100 ハードウェアプロジェクト（GitHub）',
        url: 'https://github.com/TheRobotStudio/SO-ARM100',
        note: 'BOM、3D プリント部品、組み立てガイド。自作したい人や機構を知りたい人はここ。'
      },
      {
        title: 'Linux シリアル権限と dialout グループの解説',
        url: 'https://wiki.archlinux.org/title/Working_with_the_serial_console',
        note: 'ttyUSB の権限モデルを理解できる。シリアル系のエラーで役立つ。'
      }
    ],

    summary: `**SO101 は同じアームが2本**：Leader を手で操作し、Follower がリアルタイムで再現、PC が Leader の関節角を同期記録してデモデータにする。

役割は出荷時ではなく、**配線＋設定**で決まる。アームはシステム上では \`/dev/ttyUSB*\` ファイル；初接続では高確率で \`Permission denied\` にぶつかるが、dialout グループに追加＋再ログインで解決。

次章ではソフト環境を構築し（実機不要）、LeRobot を動かす。`
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
    ],

    introduction: `この章は**実機がまったく不要**です —— ですが、初学者のおよそ8割を脱落させます。原因のほとんどは LeRobot 自体が難しいからではなく、**環境を綺麗に隔離していない**ことです：システムの Python にそのまま \`pip install\` を打ち込み、数日後にはシステムのランチャーまで壊す人がいます。

ここでは **conda** で完全に独立した環境を作ります。Python パッケージだけでなく、**Python のバージョン自体**も隔離します —— システムに何のバージョンが入っていようと関係なく、conda が LeRobot 専用に綺麗な 3.10 を用意します。壊れたら？　環境を削除して作り直せばよく、システムは無傷です。

この章では「環境を作る → LeRobot を入れる → PyTorch/CUDA を検証する」を一歩ずつ通し、いずれ必ず出会う \`CUDA out of memory\` も先に知っておきます。`,

    whyItMatters: `環境は土台。土台が歪むと後がすべて崩れます：

- システム Python に依存を入れる → いずれシステムを汚染し、収拾がつかない
- PyTorch/CUDA を検証しない → 学習時に GPU が繋がっていないと気づき、数時間を無駄にする
- OOM の応急処置を知らない → VRAM エラーが出るたびに「GPU が足りない」と思い込むが、実はパラメータを1つ変えるだけ

この章を綺麗に通せば、以降のデータ収集・学習・推論はすべて、再現可能で削除して作り直せる環境の上に成り立ちます。`,

    keyTerms: ['LeRobot', 'CUDA / AMP', 'HuggingFace Hub'],

    diagrams: [
      {
        title: 'なぜ conda で隔離するのか',
        source: `flowchart TB
    OS["💻 OS"] --> Sys["🐍 システム Python（触らない）"]
    OS --> Conda["📦 conda マネージャ"]
    Conda --> E1["🟢 env: lerobot (Python 3.10)"]
    Conda --> E2["🟡 env: 他のプロジェクト"]
    style Sys fill:#7f1d1d,stroke:#7f1d1d,color:#fff
    style E1 fill:#15803d,stroke:#15803d,color:#fff`,
        caption: 'システム Python（赤）は OS 用に残す。conda は各プロジェクトに独立環境（緑）を与え、好きに入れて、壊れたら削除して作り直す。'
      }
    ],

    walkthrough: [
      {
        title: 'LeRobot 専用環境を作る',
        body: `conda で \`lerobot\` という名前、Python バージョンを 3.10 に固定した独立環境を作ります。\`-y\` は「確認せずそのまま入れる」の意味です。

conda がまだ無ければ、先に **Miniconda** を入れてください（Anaconda は重いので不要）。`,
        command: {
          description: '環境を作成して準備',
          code: 'conda create -n lerobot python=3.10 -y'
        },
        expectedOutput: '...\nPreparing transaction: done\nVerifying transaction: done\nExecuting transaction: done\n#\n# To activate this environment, use\n#     $ conda activate lerobot',
        tip: '"To activate ... conda activate lerobot" が出れば成功です。'
      },
      {
        title: '環境を有効化して LeRobot をインストール',
        body: `まず環境を有効化し（プロンプトに \`(lerobot)\` が付きます）、GitHub からクローンして編集可能モードでインストールします。

**新しいターミナルを開くたびに必ず \`conda activate lerobot\`** —— 有効化忘れは ModuleNotFoundError の最大の原因です。`,
        command: {
          description: '有効化＋クローン＋インストール',
          code: 'conda activate lerobot\ngit clone https://github.com/huggingface/lerobot.git\ncd lerobot && pip install -e .'
        },
        expectedOutput: '(lerobot) $\n... (ダウンロード・ビルドに約 3〜5 分) ...\nSuccessfully installed lerobot torch numpy ...',
        warning: 'プロンプトに `(lerobot)` が無ければ環境が未有効です。その状態で pip が入れたものはすべて誤った場所に入ります。'
      },
      {
        title: 'PyTorch が動くか＋ GPU が見えるかを検証',
        body: `入れただけでは使えるとは限りません。1行のコードで2つを同時に検証します：PyTorch が入ったか、そして GPU が検出できるか。

\`True\` を出力 = GPU 利用可能；\`False\` を出力 = PyTorch は正しく入ったが GPU が見つからない（GPU が無い、またはドライバ未導入）。`,
        command: {
          description: '検証スクリプト',
          code: 'python -c "import torch; print(torch.cuda.is_available())"'
        },
        expectedOutput: 'True',
        tip: 'False でも慌てずに —— 下の「よくある誤解」を参照。GPU が無くても最初の6章は学べます。'
      }
    ],

    pitfalls: [
      {
        symptom: '検証で `False` が出た。入れ間違いで再インストールが必要？',
        cause: '`False` は「利用可能な GPU が見つからない」だけで、PyTorch の入れ間違いではない。',
        fix: 'GPU が無くても動きます。LeRobot は自動で CPU にフォールバックし、学習が 10〜30 倍遅くなるだけ。最初の6章（収集・データ・推論体験）は CPU で十分で、GPU が欲しいのは第7章の学習からです。削除して再インストールしても結果は同じなので、いじらないこと。'
      },
      {
        symptom: '`ModuleNotFoundError: No module named lerobot`',
        cause: '現在のターミナルで lerobot 環境を有効化していない、またはインストールが失敗している。',
        fix: 'まず `conda activate lerobot` でプロンプトに `(lerobot)` が付くことを確認し、`pip install -e .`。`pip list` で入っているか確認できます。'
      },
      {
        symptom: 'システム Python に直接 `pip install` してしまい、今システムが少し変。',
        cause: 'システムの Python 環境を汚染した。',
        fix: '今後すべてのプロジェクトで conda/venv を使って隔離し、システム Python には決して触れない。すでに汚染した場合、conda の新環境は綺麗な出発点になります。システム側の問題はディストリのドキュメントに従って修復を。'
      }
    ],

    exercises: [
      {
        title: '正しい環境にいるか確認する',
        instructions: '新しいターミナルを開き、まず何も有効化せずに `python -c "import lerobot"` を実行。何が起きる？　次に `conda activate lerobot` してもう一度実行。2回の結果を比べる。',
        hint: '未有効化では import が失敗し、有効化後は成功する。',
        expectedResult: '未有効化 → `ModuleNotFoundError`（システム Python には lerobot が無いため）。有効化後 → エラー無し。これが「新しいターミナルでは毎回 activate」の直接的な証拠です。'
      },
      {
        title: 'OOM 応急のリハーサル',
        instructions: '第7章の学習で `CUDA out of memory` が出たとします。ドキュメントを見ずに、この章の内容だけで、最初に変えるべきパラメータは？',
        hint: 'VRAM 不足 ≈ 一度に GPU へ詰め込むサンプルが多すぎる。',
        expectedResult: '`batch_size` を小さくする（例：`training.batch_size=4`）。それでも駄目なら勾配累積＋混合精度。OOM の9割は最初の一手で解決します。'
      }
    ],

    selfCheck: [
      {
        question: 'なぜシステム付属の Python を直接使わないのか？',
        answer: 'システム Python は OS 自身が使うもので、無闇にパッケージを入れると汚染し、システムツールを壊す恐れがあります。conda で独立環境を作れば、パッケージと Python バージョンを隔離でき、壊れても削除して作り直せばシステムに影響しません。'
      },
      {
        question: '`torch.cuda.is_available()` が False でも学習を続けられる？',
        answer: '続けられます。LeRobot は自動で CPU を使い、遅くなるだけです。最初の6章は GPU 不要で、ACT を学習する第7章で GPU の恩恵が明確になります。'
      },
      {
        question: '`CUDA out of memory` でまず試すべきことは？',
        answer: '`batch_size` を小さくする。これが OOM の9割の根本原因です —— 一度に計算するサンプルが多すぎて VRAM に収まらない。'
      }
    ],

    furtherReading: [
      {
        title: 'Miniconda インストールドキュメント',
        url: 'https://docs.conda.io/en/latest/miniconda.html',
        note: 'conda 導入の公式入口。Anaconda ではなく Miniconda を選ぶ。'
      },
      {
        title: 'LeRobot 公式リポジトリ README',
        url: 'https://github.com/huggingface/lerobot',
        note: 'もっとも信頼できるインストール手順。本章はこれに準拠。'
      },
      {
        title: 'PyTorch Mixed Precision (AMP) ガイド',
        url: 'https://pytorch.org/docs/stable/amp.html',
        note: 'VRAM が厳しいときの公式解。第7章で使う。'
      }
    ],

    summary: `**conda で独立環境を作り**、システム Python には触れない。\`conda create -n lerobot python=3.10\` → \`conda activate lerobot\` → クローン＋ \`pip install -e .\` → \`torch.cuda.is_available()\` で検証。

鉄則は2つ：新しいターミナルではまず \`activate\`；\`CUDA out of memory\` はまず \`batch_size\` を小さく。

次章では PC に実機の2本のシリアルを正しく認識させ、重要なキャリブレーションを行う。`
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
    ],

    introduction: `2本の USB を挿し、\`ls /dev/tty*\` で ttyUSB0 と ttyUSB1 も見えています。でもデータ収集を始めるには、あと2ステップ必要です：

1. **どのポートが Leader でどれが Follower かを LeRobot に伝える** —— コマンド引数に書く
2. **キャリブレーション** —— 各モータの「本当の零点」を PC に教える

キャリブレーションがこの章の要で、もっとも見落とされやすく、見落とすと必ず問題になる一歩です。ロボットアームは出荷時、各モータの零点に組み立て公差があります：「30度へ」と言っても、実際には 31度や 28度に行くことがあります。キャリブレーションしないと、Follower の追従がずれ、録ったデータが歪み、学習したモデルは必ず崩れます。

この一歩は**飛ばせません**が、スクリプトが一歩ずつ案内してくれるので 3 分で終わります。`,

    whyItMatters: `キャリブレーションはデータ品質の最初の関門です：

- 未キャリブレーション → Leader が 30度を読むのに Follower が実際 33度 → A の動作を録ったつもりが、データセットに入るのは B → モデルは誤ったものを学ぶ
- ポート設定ミス → スクリプトが \`Missing required field(s) port\` を出す、または接続できない
- キャリブレーションは「ゴミを入れればゴミが出る」の最前段：**ここでずれると、後で学習にどれだけ力を入れても無駄**`,

    keyTerms: ['キャリブレーション', 'Leader / Follower', 'シリアルポート'],

    diagrams: [
      {
        title: 'キャリブレーション前 vs 後',
        source: `flowchart LR
    subgraph Before ["未キャリブレーション"]
        B1["Leader が 30度を読む"] -.->|"3度のずれ"| B2["Follower 実際 33度"]
    end
    subgraph After ["キャリブレーション後"]
        A1["Leader が 30度を読む"] -->|"一致"| A2["Follower 実際 30度"]
    end
    style Before fill:#fef2f2,stroke:#dc2626
    style After fill:#f0fdf4,stroke:#16a34a`,
        caption: 'キャリブレーションは Leader の読み値と Follower の実姿勢を揃える。未実施だと 1〜5 度のずれがデータセット全体を汚染する。'
      }
    ],

    walkthrough: [
      {
        title: 'どのポートがどのアームかを見分ける',
        body: `もっとも確実な手作業：\`ls /dev/tty*\` を一度見る → Leader の USB を抜く → もう一度見る。減った方が Leader です。

LeRobot には探索ツール \`find_motors_bus_port.py\` もあり、各ポートに「あなたは何番モータ？」と順に尋ねて対応を教えてくれます。ケーブルを抜かずに済みます。`,
        command: {
          description: 'シリアルを確認（抜く前後で比較）',
          code: 'ls /dev/tty*'
        },
        expectedOutput: '1回目:  ttyUSB0  ttyUSB1\n2回目:  ttyUSB0            ← ttyUSB1 が消えた = いま抜いた Leader'
      },
      {
        title: 'ポートをコマンド引数に書く',
        body: `どの ttyUSB がどの役割か分かったら、ポートを新版 LeRobot CLI 引数に直接書きます：Follower は \`--robot.port\`、Leader は \`--teleop.port\`。

例えば Follower が \`/dev/ttyACM0\`、Leader が \`/dev/ttyACM1\`。以降のキャリブレーション・遠隔操作・データ録画もこの2つのポートを使います。`,
        command: {
          description: '新版 CLI のポート引数',
          code: '--robot.port=/dev/ttyACM0\n--teleop.port=/dev/ttyACM1'
        },
        warning: '再起動後はポート番号が入れ替わることがあります。その際はまず `ls /dev/tty*` を実行し直し、コマンド引数を更新してください。'
      },
      {
        title: 'キャリブレーションを実行',
        body: `キャリブレーションスクリプトを実行すると、ロボットアームを**手で指定姿勢に動かす**よう一歩ずつ案内されます（完全伸展、零位など）。1姿勢ごとに Enter を押します。全体で 1〜2 分、データは自動で \`~/.cache/.../calibration.json\` に保存されます。`,
        command: {
          description: 'キャリブレーション開始',
          code: 'lerobot-calibrate \\\n  --robot.type=so101_follower \\\n  --robot.port=/dev/ttyACM0 \\\n  --robot.id=so101_follower'
        },
        expectedOutput: 'Calibrating leader_arms/main...\n[INFO] Move arm to fully-extended pose, press Enter...\n[INFO] Move arm to home pose, press Enter...\n[INFO] Saving calibration ... Done!',
        warning: '手で姿勢を作るときは**やさしく動かす**こと。SO101 のモータはダンパが無く、無理に動かすとギアを傷める恐れがあります。'
      }
    ],

    pitfalls: [
      {
        symptom: 'キャリブレーションしたのに、Follower の追従がまだずれる。',
        cause: '姿勢合わせが不正確 —— 「完全伸展」が実は8割しか伸びておらず、基準点がずれた。',
        fix: 'キャリブレーションをやり直し、指示/図に厳密に合わせる。定規で照合してもよい。データは旧いものを上書きするので、やり直しは安全。'
      },
      {
        symptom: '`Missing required field(s) port`',
        cause: 'yaml に port が無い、またはインデントが誤っていて解析されていない。',
        fix: 'leader_arms / follower_arms の下に、正しいインデントで `port:` を補う。YAML はインデントに敏感。Tab ではなくスペースを使う。'
      },
      {
        symptom: '「キャリブレーションは一度やれば永久でしょ？」',
        cause: 'キャリブレーションが終身有効だと思い込んでいる。',
        fix: 'データはディスクに保存され、電源を切っても消えない；ただし**モータ交換・分解組立・輸送の振動**の後は零点が変わるので再実施が必要。普段は繰り返さなくてよい。'
      }
    ],

    exercises: [
      {
        title: '再キャリブレーションの要否を判断する',
        instructions: `次のうち再キャリブレーションが必要なのは？\n\nA. 一晩電源を切り、翌日起動\nB. ロボットアームを机から落とした\nC. モータを1つ交換した\nD. USB を挿し直しただけ`,
        hint: 'キャリブレーションデータはディスクにある。失われるのは「物理的な零点」であってファイルではない。',
        expectedResult: '要再実施：**B（落下）、C（モータ交換）**。不要：A（データはディスクにあり消えない）、D（USB の抜き差しはモータ零点に影響しないが、ttyUSB 番号が変わる可能性があるので yaml のポートは確認）。'
      }
    ],

    selfCheck: [
      {
        question: 'キャリブレーションせずにデータ収集するとどうなる？',
        answer: 'Leader の読み値と Follower の実姿勢が合わず、データセットに録る (s, a) がずれます。このデータで学習すると、モデルが学ぶ写像自体が歪んでいて、いくら学習しても精度が出ません。'
      },
      {
        question: '1本のアームで何個のモータをキャリブレーションする？',
        answer: '6個（各関節1つ）。スクリプトが自動で順に進めるので手動選択は不要。2本なら 12 個。'
      },
      {
        question: 'ロボットアームの役割（Leader/Follower）はどう決まる？',
        answer: '設定ファイルの leader_arms / follower_arms にそれぞれ書く port で決まり、ハードウェアの出荷時に決まるのではありません。'
      }
    ],

    furtherReading: [
      {
        title: 'LeRobot ロボット制御スクリプトのドキュメント',
        url: 'https://github.com/huggingface/lerobot',
        note: '新版 LeRobot CLI の calibrate / teleoperate / record コマンドの説明。'
      }
    ],

    summary: `2ステップ：**ポートを見分ける**（抜線法または find_motors）→ 新版 CLI の \`--robot.port\` / \`--teleop.port\` に書く；**キャリブレーション**（lerobot-calibrate を実行し、手で姿勢を作って零点を記録）。

キャリブレーションは Leader の読み値と Follower の実姿勢を揃える、データ品質の最初の関門。ハードウェアに変更が無ければやり直し不要。

次章はいちばん楽しい部分：実際にロボットアームを持って動作を実演し、データを録る。`
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
    errors: [],

    introduction: `準備はすべて整いました。いよいよ一番楽しく、一番疲れる一歩です：**自分の手で Leader を動かし、Follower を追従させ、その全過程を PC に録画する**。この録画が AI に与える「デモデータ」です。

この章には直感に反するが極めて重要な考えがあります：**データの質 > 量、そして質の核心は「多様性」**。初心者がもっとも犯しがちな失敗は、同じ動作を同じ位置で 50 回きっちり録ること —— 結果、モデルはその1場面を「丸暗記」するだけで、コップが1cm ずれただけで動けなくなります。

ここでは：遠隔操作の手応えをまず確認する方法、本番の録り方、何件録るか、そして「わざと変化をつけて」モデルに本当に汎化させる方法を明確にします。`,

    whyItMatters: `データ収集はパイプライン全体で**もっとも人手がかかり、結果への影響も最大**の一歩です：

- うまく録れた → モデルの汎化が強く、環境が変わっても耐える
- 「綺麗すぎ・一様すぎ」に録った → 過学習し、本番で少しの揺らぎで崩れる
- 失敗デモの扱いを誤る → 貴重な「修正信号」を捨てるか、比率が高すぎて目標を汚染する

この一歩は GPU が無くてもでき、最終結果に自分の手で影響できる肝心な工程です。`,

    keyTerms: ['遠隔操作', 'Leader / Follower', 'データセット', 'LeRobot Dataset'],

    diagrams: [
      {
        title: '収集時、1フレームで何が起きるか',
        source: `flowchart LR
    Hand["👋 Leader を動かす"] --> Read["Leader の関節角を読む = action a"]
    Read --> Follow["Follower が再現"]
    Read --> Cam["カメラが1フレーム撮影 = 環境状態"]
    Follow --> Save["データセット (s, a) に書き込み"]
    Cam --> Save
    Save -.->|"30 fps ループ"| Hand
    style Save fill:#22c55e,stroke:#22c55e,color:#fff`,
        caption: '各フレーム：Leader の角度を action として読む、カメラが環境を撮る、Follower が再現、すべてまとめてディスクへ。毎秒 30 回。'
      }
    ],

    walkthrough: [
      {
        title: 'まず純粋な遠隔操作で手応えを確認',
        body: `いきなり録らない。まず teleoperate（データ保存なし）を実行し、Leader → Follower の同期が正常で遅延が小さいか確認します。Leader を動かすと、Follower がほぼリアルタイムで追従するはずです。

30 秒試して手応えが良ければ Ctrl+C で抜け、本番録画へ。`,
        command: {
          description: '録画せず遠隔操作のみ',
          code: 'lerobot-teleoperate \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --display_data=true'
        },
        expectedOutput: '[INFO] Connected to leader_arms/main\n[INFO] Connected to follower_arms/main\n[INFO] Teleoperation started. Move the leader arm.',
        tip: '追従に明らかな遅延/ガタつき？　アームをハブ経由でなくマザーボードの USB に直挿しし、fps を 30 に固定。'
      },
      {
        title: '本番のデータセット録画',
        body: `record モードに切り替え、データセット名・録る件数・フレームレートを付けます。\`--dataset.repo_id\` は自分で付ける名前（実際に HuggingFace へ上げる必要はない）；\`--dataset.num_episodes\` は総件数；\`--dataset.fps 30\` は手頃なフレームレート。

1件録るごとに Enter で次を開始する案内が出るので、物体を置き直せます。`,
        command: {
          description: 'デモを 50 件録る',
          code: 'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --dataset.repo_id=your-name/so101-pick-cup \\\n  --dataset.num_episodes=50 --dataset.fps=30 \\\n  --display_data=true'
        },
        expectedOutput: 'Recording episode 1/50...\n[INFO] Press Enter when ready, Ctrl+C to abort.\nEpisode 1 saved (132 frames, 4.4 s)',
        warning: '録画は**最後まで完走**しないと meta/info.json が書かれません。途中で Ctrl+C 強制終了すると meta が欠落し、第6章/学習で FileNotFoundError になります。'
      },
      {
        title: 'わざと多様性をつくる',
        body: `これが成否を分ける一歩。50 件を録るとき**毎回同じにしない**：

- 物体位置を毎回 ±3〜5 cm ずらす
- 物体の向き（取っ手を左/右/手前）もいろいろ録る
- 開始姿勢・動作の速さに変化をつける
- 別の時間帯（光が違う）でも録る、机に邪魔物を置く
- たまの失敗→やり直しも録る（誤りからの回復を教える）

目標：50 件の中に**まったく同じものが2件と無い**こと。`,
        tip: '単純な pick-place ≈ 50 件；USB 挿入のような難度 ≈ 100〜200 件；タオル畳みは 300 件以上。ただし多様な 50 件 > 似た 200 件。'
      }
    ],

    pitfalls: [
      {
        symptom: '学習後、モデルが特定の固定位置でしか動かず、物体がずれると失敗する。',
        cause: '収集時に物体を毎回同じ位置に置き、モデルがその座標に過学習した。',
        fix: '録り直し、物体の位置/向き/光を意図的に変える。汎化は学習分布の広さから来るもので、繰り返し回数からではない。'
      },
      {
        symptom: '10 件録っただけで学習を始めたら、学習できなかった。',
        cause: 'データ量が大幅に不足し、カバーする状態空間が狭すぎる。',
        fix: '単純なタスクでも最低 50 件、かつ多様に。10 件はほぼ確実に過学習する。'
      },
      {
        symptom: 'あるデモが途中で失敗した（コップを落とした）。削除すべき？',
        cause: '失敗データを「汚いデータ」だと思っている。',
        fix: '残して失敗ラベルを付ける方がよい —— 「こうすると駄目」という負信号になる。ただし失敗比率は ~30% を超えないこと。超えると学習目標を汚染する。'
      }
    ],

    exercises: [
      {
        title: 'サンプル量を見積もる',
        instructions: '30 fps で 50 件、平均5秒のデモを録った。合計で何フレーム（≈ 何個の (s, a) サンプル）？',
        hint: 'fps × 1件の秒数 × 件数。',
        expectedResult: '30 × 5 × 50 = **7500 フレーム**。1フレームに1つの (s, a) なので約 7500 個の学習サンプル —— ACT には十分。'
      },
      {
        title: '自分の多様性チェックリストを作る',
        instructions: '「コップを皿に置く」タスクで、50 件のデモ内で意図的に変化させる次元を4つ挙げる。',
        hint: '環境の中で「次は違うかもしれない」ものを考える。',
        expectedResult: '参考：① コップの初期位置 ② コップの向き/取っ手の方向 ③ 皿の位置 ④ 把持の速さ。加えて：光、机の邪魔物、アームの開始姿勢。妥当な4つならよい。'
      }
    ],

    selfCheck: [
      {
        question: 'なぜ同じ動作を同じ位置で 50 回録ってはいけない？',
        answer: 'その固定場面に過学習し、「丸暗記」しかできず「応用」できなくなるから。環境が少し変わる（物体移動、光変化）と崩れる。汎化は学習分布の多様性から生まれる。'
      },
      {
        question: '録画中に Ctrl+C するとどうなる？',
        answer: 'meta/info.json が生成されません（全件録り終えてから一括で書かれる）。後でデータセット読み込みや学習で FileNotFoundError になります。完走するか、録り済み data から meta を再構築するツールを使う。'
      },
      {
        question: '失敗デモはどう扱う？',
        answer: '残す＋失敗ラベル。「何をすべきでないか」の負信号をモデルに与える。比率は 30% 以内に。完全に削除すると、失敗状態への事前知識をモデルが持てなくなる。'
      }
    ],

    furtherReading: [
      {
        title: 'LeRobot データ収集チュートリアル動画',
        url: 'https://www.youtube.com/playlist?list=PL3vV3-eqf-bp9DvB7-EkS8DGHE9pXVKlS',
        note: 'HuggingFace 公式による遠隔操作＋録画の実演フロー。'
      },
      {
        title: 'DROID データセット',
        url: 'https://droid-dataset.github.io/',
        note: '大規模・高多様性のデータセットの実例。産業レベルで「多様性」をどう作るか分かる。'
      }
    ],

    summary: `まず \`teleoperate\` で手応えを確認し、次に \`record\` で本番録画。**質 > 量、質 = 多様性**：物体の位置/向き/光/速さを意図的に変え、50 件に同じものが2件と無いように。

単純タスクは ~50 件；失敗デモは残して印を付ける（<30%）；録画は完走しないと meta が書かれない。

次章では録ったデータセットを開き、ディスク上でどんな姿をしているか見る。`
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
    ],

    introduction: `さっき 50 件のデモを録りました。それは今ディスクのどこに、どんな姿で？　この章では開いて中を見ます —— データセット構造を理解すれば、学習でエラーが出たとき素早く原因を特定できます。

データセットは \`~/.cache/huggingface/lerobot/<repo-id>/\` の下にあり、3つの中核ディレクトリで構成されます：**data/**（関節角度、とても小さい）、**videos/**（カメラフレーム、とても大きい）、**meta/**（このデータセットが何かを記述）。

なかでも \`meta/info.json\` はデータセット全体の「身分証」で、初心者が最も遭遇する \`FileNotFoundError: meta/info.json\` の主役 —— 理解すれば多くの時間を節約できます。`,

    whyItMatters: `データ構造を理解しないと、学習エラー時に手が出せません：

- info.json の役割を知らない → FileNotFoundError でどこから調べるか分からない
- 動画が容量の95%を占めると知らない → ディスクが溢れても何を圧縮すべきか分からない
- LeRobotDataset で検証しない → 壊れたデータで学習し、数時間後に気づく

この章は短いですが、第7章で学習に問題が出たとき「データセットの問題か？」を真っ先に判断できるようになります。`,

    keyTerms: ['LeRobot Dataset', 'meta', 'データセット', 'HuggingFace Hub'],

    diagrams: [
      {
        title: 'データセットのディレクトリ構造',
        source: `flowchart TD
    Root["📁 so100-pick-cup/"] --> Data["📁 data/ 関節角度"]
    Root --> Meta["📁 meta/ メタ情報"]
    Root --> Videos["📁 videos/ カメラフレーム"]
    Data --> P["📄 episode_000.parquet ..."]
    Meta --> Info["📄 info.json / episodes.jsonl / stats.json"]
    Videos --> M["🎥 episode_000.mp4 ..."]
    style Data fill:#dbeafe,stroke:#3b82f6
    style Meta fill:#fef3c7,stroke:#f59e0b
    style Videos fill:#fce7f3,stroke:#ec4899`,
        caption: 'data は関節（KB 級）、videos はカメラフレーム（MB 級、容量の 95%+ を占める）、meta はデータセット自身を記述。'
      }
    ],

    walkthrough: [
      {
        title: 'ディレクトリ構造をざっと見る',
        body: `\`tree\` でデータセットのディレクトリを眺め、全体像をつかみます：parquet は data/chunk-000/ の下、動画はカメラごとのフォルダで videos/ の下、meta/ にはいくつかの json が全体情報を記述します。`,
        command: {
          description: '構造を確認',
          code: 'tree ~/.cache/huggingface/lerobot/your-name/so101-pick-cup'
        },
        expectedOutput: 'so100-pick-cup/\n├── data/\n│   └── chunk-000/  episode_000.parquet ...\n├── meta/\n│   ├── info.json  episodes.jsonl  stats.json\n└── videos/\n    └── observation.images.cam_top/  episode_000.mp4 ...'
      },
      {
        title: 'info.json を開く —— データセットの身分証',
        body: `\`info.json\` は episodes 総数、総フレーム数、fps、状態/行動の次元、カメラ構成、schema バージョンを記録します。学習時に LeRobot が**まず最初に読む**もので、読めなければ即クラッシュします。

\`cat\` して論理を照合：total_episodes × 平均フレーム数 ≈ total_frames。データセットが完整かの確認に役立ちます。`,
        command: {
          description: 'メタデータを確認',
          code: 'cat ~/.cache/huggingface/lerobot/your-name/so101-pick-cup/meta/info.json'
        },
        expectedOutput: '{\n  "robot_type": "so100",\n  "total_episodes": 50,\n  "total_frames": 7423,\n  "fps": 30,\n  "features": {\n    "observation.state": {"dtype": "float32", "shape": [6]},\n    "action": {"dtype": "float32", "shape": [6]}\n  }\n}',
        tip: 'total_episodes=50、total_frames≈7500 → 1件平均 150 フレーム = 5 秒×30fps。論理的に整合。'
      },
      {
        title: 'コードで読み込めるか検証',
        body: `ファイルを見るだけでは不十分。LeRobotDataset で実際に一度読み込み、成功して初めてデータセット構造に問題が無く、学習に使えると分かります。`,
        command: {
          description: '読み込み検証',
          code: 'python -c "from lerobot.common.datasets.lerobot_dataset import LeRobotDataset; ds = LeRobotDataset(\'your-name/so101-pick-cup\'); print(len(ds))"'
        },
        expectedOutput: '7423   # フレーム数を出力 = 読み込み成功',
        warning: 'このステップでエラー（特に FileNotFoundError: meta/info.json）が出たらデータセットが不完整です。学習を急がず、録り直すか meta を再構築してください。'
      }
    ],

    pitfalls: [
      {
        symptom: '学習を開始すると即 `FileNotFoundError: meta/info.json`。',
        cause: '前回の record を途中で Ctrl+C 強制終了した —— data/ に一部 parquet はあるが、meta/ が未生成（全件録了後にまとめて書かれる）。',
        fix: '完整に録り直すか、LeRobot のツールスクリプトで data/ から meta を再構築する。確認：`ls -la .../meta/` が空でないか。'
      },
      {
        symptom: 'ディスクがすぐにデータセットで埋まる。',
        cause: '動画フレームがデータセットの 95%+ を占め、関節データはごくわずか。',
        fix: '容量を節約したいならカメラ解像度を下げる / H.265 で符号化 / カメラ台数を減らす。data/ を消しても無意味 —— もともと小さい。'
      }
    ],

    exercises: [
      {
        title: '関節データの容量を計算する',
        instructions: 'info.json に fps=30、state と action が共に 6 次元 float32 とある。7 秒のデモ1件の純関節データはおよそ何 KB？',
        hint: 'フレーム数 × (6+6) × 4 バイト。',
        expectedResult: '30×7=210 フレーム；1フレーム 12 個の float32 × 4 バイト = 48 バイト；210×48 ≈ **10 KB**。50 件でも ~500 KB —— だから「容量を食うのは動画で関節データではない」。'
      }
    ],

    selfCheck: [
      {
        question: 'なぜ info.json はそんなに重要なのか？',
        answer: 'データセットの「身分証」だからです：episodes 数、フレーム数、fps、次元、カメラ構成を記録。LeRobot は学習前にまずこれを読み、欠損や破損があると即 FileNotFoundError で学習できません。'
      },
      {
        question: '3つのディレクトリでどれが最も容量を食う？',
        answer: 'videos/（カメラフレーム）で 95%+。data/（関節）は毎秒数 KB、meta/ は小さな json がいくつか。'
      },
      {
        question: 'データセットが学習に使えるかどう確認する？',
        answer: '`LeRobotDataset(\'repo-id\')` で一度読み込み、長さを返せれば構造は完整。エラーが出たらデータセットを直してから学習する。'
      }
    ],

    furtherReading: [
      {
        title: 'HuggingFace LeRobot モデル/データセットライブラリ',
        url: 'https://huggingface.co/lerobot',
        note: '公開されたデータセット構造を見て、data/meta/videos のレイアウトを対照して理解する。'
      }
    ],

    summary: `データセットは \`~/.cache/huggingface/lerobot/<repo-id>/\` にあり、3大ディレクトリ：**data**（関節、小）、**videos**（カメラ、容量の 95%）、**meta**（情報）。

\`meta/info.json\` は身分証で、欠けると FileNotFoundError —— 多くは record の途中強制終了が原因。学習前に LeRobotDataset で一度読み込み、完整性を検証する。

次章は本題：ニューラルネットワークに本当に学習を始めさせる。`
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
