import type { Lesson } from './lesson-types'

/**
 * 日本語版インタラクティブ講座 —— lessons.ts の対訳。
 * /ja/learn/[id]/play で使用。型は同一なので構造は lessons.ts と揃える。
 * （AI 翻訳。公開前に日本語ネイティブの校正を推奨。）
 */

export const lessonsJa: Record<number, Lesson> = {
  1: {
    chapterId: 1,
    title: '模倣学習とは何か',
    estimatedMinutes: 7,
    cards: [
      {
        id: 'c1-01-hook',
        type: 'intro',
        emoji: '🦾',
        title: '想像してみよう',
        body: 'あなたはロボットアームを買ったばかり。\n\n机の上に置いてある。\n\n電源を入れる。**緑のランプが点いた**。',
        cta: 'それで？'
      },
      {
        id: 'c1-02-it-cant',
        type: 'reveal',
        prompt: 'あなたは言う：「ロボットアーム、水を一杯ついで。」\n\nどう反応する？',
        revealCta: 'どう答えるか見る',
        reveal:
          '## 🦾 ⚙️ Beep.\n\n> 「私はまだ何も学んでいません。」\n\n本当です。出荷したてのロボットアームは**動けるだけの金属の塊**にすぎません。何かをさせるには、**教える**必要があります。\n\n問題は —— どうやって教える？',
        followCta: '考えてみる →'
      },
      {
        id: 'c1-03-which-path',
        type: 'choice',
        question: 'このロボットアームに水のつぎ方をどう教える？',
        options: [
          {
            id: 'manual',
            emoji: '📖',
            label: 'A. 超詳細な説明書を書いてやる',
            feedback:
              'ははっ、書き終わる頃には定年です。\n\n「コップがどこにあるか」だけで 1000 通りの位置がある。**光が変わった、机に物がある、コップを誰かが動かした** —— それぞれにルールを書く必要があります。\n\nこれが 1990 年代以前のロボット専門家がやっていたこと —— 書き切れません。\n\nB を見てみましょう。'
          },
          {
            id: 'demo',
            emoji: '👋',
            label: 'B. 自分で手本を見せて学ばせる',
            feedback:
              '✨ **その発想です。**\n\nルールを教えるのではなく、**実演**して見せる。「水のつぎ方」を 50 回見せて、自分で悟らせる。\n\nこの方法には名前があります ——',
            correct: true
          },
          {
            id: 'chatgpt',
            emoji: '🤖',
            label: 'C. ChatGPT に教えてもらう',
            feedback:
              'ははっ、甘い。ChatGPT はあなたの家のアームを動かせません。\n\nでも方向性は合っています —— **機械に自分で学ばせる** ほうが **ルールを書く** より強い。B を見て。'
          }
        ]
      },
      {
        id: 'c1-04-define-il',
        type: 'reveal',
        prompt: 'この名前を頭に刻みつけて：',
        revealCta: '記憶する',
        reveal:
          '## 模倣学習 \n### Imitation Learning (IL)\n\n> 機械に「人がどうやるか」のデモをたくさん見せ、自分で**方策**を学ばせる。\n\n**方策 (policy)** は翻訳機です：\n\n```\n今の状況を見る  →  次にどう動くかを出力\n```\n\n簡単そう。でもすぐに**致命的な問題**に気づきます…',
        followCta: '致命的な問題とは →'
      },
      {
        id: 'c1-05-the-trap',
        type: 'choice',
        question:
          '水つぎを 5 回実演して、ロボットは覚えた。\n\n6 回目、**コップを左に 0.5 センチ動かした**。\n\nどうなる？',
        options: [
          {
            id: 'perfect',
            label: '🎯 完璧にこなす',
            feedback:
              '残念、違います。\n\nロボットは「コップが少しずれた」画面を一度も見たことがありません —— 何か変だと感じ、動作が**ほんの少しずれます**。'
          },
          {
            id: 'wobble',
            label: '🤏 動作が少しだけずれる',
            feedback:
              '正解。でも話は**まだ終わりません**。\n\nこの「少しずれた」が**連鎖反応**を引き起こします。次へ →',
            correct: true
          },
          {
            id: 'crash',
            label: '💥 完全に失敗',
            feedback:
              '少し大げさ。\n\n6 回目ではまだ完全失敗には至りません。でも**30 回目**は？　十分あり得ます。理由は ——'
          }
        ]
      },
      {
        id: 'c1-06-compounding',
        type: 'reveal',
        prompt: 'この連鎖反応には名前があります。模倣学習**最大の敵**です。',
        revealCta: '敵の名前を明かす',
        reveal:
          '## 複合誤差 🌨️\n### Compounding Error\n\n```\n6 回目  → 0.5 度ずれる\n7 回目  → 1.5 度ずれる  (画面が 6 回目よりさらに変だから)\n8 回目  → 4   度ずれる\n9 回目  → 完全にずれる\n```\n\n**誤差が雪だるまのように膨らむ。**\n\n朗報：現代のアルゴリズム (ACT、Diffusion Policy) はどれもこれを治せます。この先の 7 章で少しずつ対処法を学びます。',
        followCta: '図で整理しよう →'
      },
      {
        id: 'c1-07-pipeline-viz',
        type: 'viz',
        title: '一枚の図で全体像をつかむ',
        body: '覚えようとしなくていい、図を見るだけ。派手なアルゴリズムはどれも同じことをしている ——',
        mermaid: `flowchart LR
    A["👤 あなた (デモ)"] -->|"50 回録る"| B["📦 データセット"]
    B -->|"学習"| C["🧠 方策"]
    C -->|"行動を出力"| D["🦾 ロボットアーム"]
    D -.->|"新しい状況"| C
    style A fill:#7c5cff,stroke:#7c5cff,color:#fff
    style C fill:#22c55e,stroke:#22c55e,color:#fff
    style D fill:#0ea5e9,stroke:#0ea5e9,color:#fff`,
        caption: '人がデモを生む → データセットで方策を学習 → 方策がアームを指揮 → アームが新しい状況に出会う → 方策に戻す。IL は全部この循環。'
      },
      {
        id: 'c1-08-vocab',
        type: 'match',
        prompt: '3 つの語を速記。左と右を結んで：',
        pairs: [
          { left: '状態 s', right: 'アームの今の関節角度' },
          { left: '行動 a', right: '次の瞬間に関節が向かう角度' },
          { left: '方策 π', right: 's を見て a を出す翻訳機' }
        ]
      },
      {
        id: 'c1-09-numeric',
        type: 'numeric',
        question:
          'SO101 アームには **6 つの関節** があります。\n\n**30 fps** で **10 秒** のデモを録ります。\n\nこのデモには (s, a) のサンプル対がいくつ含まれる？',
        answer: 300,
        unit: '組',
        hint: 'フレームレート × 秒数 = 総フレーム数。1 フレームが 1 つの (s, a) 対。',
        explanation:
          '## ✅ 30 × 10 = **300 組**\n\nついでに：\n\n- 1 組の合計次元 = 6 + 6 = **12 次元**\n- 全体を float32 で保存 = 300 × 12 × 4 = **14.4 KB**\n\n**信じられないほど小さい。** だから LeRobot は数千件のデモでも数百 MB で済む —— 本当に容量を食うのは**カメラの動画フレーム**です。'
      },
      {
        id: 'c1-10-bc-vs-act',
        type: 'mcq',
        question: '複合誤差という雪だるま、**どう治す**？',
        options: [
          { id: 'more-data', label: 'もっとデータを集め、1 万回実演する' },
          {
            id: 'predict-chunks',
            label: '方策に一**段**の行動をまとめて予測させ、未来の行動の一貫性で誤差を吸収する'
          },
          { id: 'just-restart', label: 'ずれたらアームを再起動する' },
          { id: 'use-llm', label: 'ChatGPT にリアルタイムで操作させる' }
        ],
        correctOptionId: 'predict-chunks',
        explanation:
          '## 一度に一段の行動を予測する\n\nこれが **ACT (Action Chunking Transformer)** の核心の発想です：\n\n```\nBC:  1 フレーム見る → 1 ステップの行動 → ずれが累積\nACT: 1 フレーム見る → 未来 100 ステップの行動 → 段内で自己完結\n```\n\nこの先の**第 7 章**で ACT を専門に扱います。**まず名前だけ覚えれば OK**、原理は徐々に。'
      },
      {
        id: 'c1-11-recap',
        type: 'recap',
        title: '🧠 この講座で学んだこと：',
        bullets: [
          '🎯 **模倣学習** = 機械にデモを見せ、方策を学ばせる',
          '📖 ルールを書かなくていい、機械が自分で悟る',
          '⚠️ **複合誤差** = 誤差が雪だるま式に膨らむ —— BC 最大の敵',
          '🧊 **ACT** は「一度に一段の行動を予測」して雪だるまを治す',
          '📐 **状態 s** = 関節角度  ·  **行動 a** = 次の瞬間の角度  ·  **方策 π** = 翻訳機'
        ]
      },
      {
        id: 'c1-12-completion',
        type: 'completion',
        title: '🎉 第 1 課クリア',
        body:
          '模倣学習とは何か、なぜ失敗するのか、なぜ ACT が必要かを理解しました。\n\n次の課では **SO101 のハードウェア** を開け、Leader アームと Follower アームがどうやって「デモデータ」を生むのかを見ます。\n\n続けますか？',
        nextChapterId: 2
      }
    ]
  },

  2: {
    chapterId: 2,
    title: 'SO101 のハードウェアを見る',
    estimatedMinutes: 8,
    cards: [
      {
        id: 'c2-01-package',
        type: 'intro',
        emoji: '📦',
        title: '注文したアームが今日届いた',
        body: '配達員が、思ったより**大きい**箱を机に置いていった。\n\n開けてみる。',
        cta: '中を見る →'
      },
      {
        id: 'c2-02-unbox',
        type: 'reveal',
        prompt: '箱を開けると、目に入ったのは ——',
        revealCta: '明かす',
        reveal:
          '## 🦾  🦾\n\n**2 本**のアーム。1 本ではない。\n\n見た目はまったく同じ：同じ関節数、同じケーブル、同じグリッパ。\n\nでも役割はまったく違う。**これが SO101 の核となる設計**。',
        followCta: 'なぜ 2 本？ →'
      },
      {
        id: 'c2-03-why-two',
        type: 'choice',
        question: 'なぜ SO101 は 2 本のアームにしている？',
        options: [
          {
            id: 'two-hands',
            emoji: '🤲',
            label: 'A. 人に手が 2 つあるように、協調して物をつかむため',
            feedback:
              'それは ALOHA のような**両手協調タスク**で必要な構成。SO101 は既定では「片方を人が操作 + もう片方を機械が複製」で、両手でつかむのではありません。\n\nB を見て →'
          },
          {
            id: 'leader-follower',
            emoji: '👋',
            label: 'B. 片方を人が手動操作し、もう片方が人の動きを複製する',
            feedback:
              '✨ **正解。**\n\n片方のアームを握って動作を実演すると、もう一方が**リアルタイムで**あなたの関節角度を複製する。これが学習データの集め方 —— 機械に「実演」して見せる。',
            correct: true
          },
          {
            id: 'spare',
            emoji: '🔁',
            label: 'C. 片方は予備、もう片方が壊れたとき用',
            feedback:
              'バックアップに 2 本目を買うのは贅沢すぎ —— 予備は普通モータを買う。\n\nここの 2 本は**協調動作**します。B を見て →'
          }
        ]
      },
      {
        id: 'c2-04-define',
        type: 'reveal',
        prompt: '2 本のアームの役割の名前 ——',
        revealCta: '記憶する',
        reveal:
          '## 主腕 vs 従腕\n\n- **Leader（主腕）**：あなたが握り、**人が手動操作**する。あなたの関節の意図を感じ取る。\n- **Follower（従腕）**：Leader の関節角度を複製し、**リアルタイムで追従**する。「機械が何をしているか」を見せる。\n\nLeader を持って「コップを取る」動作を実演 → PC が同時に Leader の関節角を記録（これが `action` a）+ Follower に追従させる（結果が正しいか見せる）。\n\n**これがデータ収集のすべての秘密。**',
        followCta: '図で流れを刻もう →'
      },
      {
        id: 'c2-05-topology',
        type: 'viz',
        title: 'Leader-Follower はどう繋がっているか',
        mermaid: `flowchart LR
    H["👋 あなたの手"] -->|"関節を動かす"| L["🦾 Leader (主腕)"]
    L -->|"USB"| PC["💻 PC"]
    PC -->|"USB"| F["🦾 Follower (従腕)"]
    PC -->|"データ録画"| D["📦 データセット"]
    style L fill:#7c5cff,stroke:#7c5cff,color:#fff
    style F fill:#0ea5e9,stroke:#0ea5e9,color:#fff
    style PC fill:#22c55e,stroke:#22c55e,color:#fff`,
        caption: 'あなた → Leader → USB → PC → USB → Follower。PC は同時に Leader の関節角をデータセットに書き込む。全リンクが 30 fps で回り続ける。'
      },
      {
        id: 'c2-06-tell-apart',
        type: 'mcq',
        question: '問題：目の前に同じ見た目のアームが 2 本。**どちらが Leader でどちらが Follower か、どう見分ける？**',
        options: [
          { id: 'color', label: '色を見る —— メーカーが必ず色分けしている' },
          { id: 'label', label: 'シールを見る —— Leader には "L" が貼ってある' },
          { id: 'cable', label: '接続を見る —— 「Leader ポート」に挿したのが Leader' },
          { id: 'feel', label: '手で動かす —— 通電していない Leader はゆるい' }
        ],
        correctOptionId: 'cable',
        explanation:
          '## 役割は「ソフト設定」で決まる\n\nSO101 は出荷時、2 本のアームが**まったく同じ**。どちらが Leader でどちらが Follower かは**設定ファイルで指定する** —— どちらをどの USB ポートに挿すか + 設定でどのポートを leader / follower と書くか。\n\n実際には、まず両方を PC に挿し、ツールでどの ttyUSB がどちらか調べ、yaml に明記します。次の課でこれをやります。'
      },
      {
        id: 'c2-07-list-ports',
        type: 'command',
        title: '最初の本物のコマンド',
        intro: 'Linux / macOS では、アームを USB に挿すと `/dev/ttyUSB?` という「ファイル」になります。\n\nこのコマンドでその種のファイルを全部表示：',
        description: 'ターミナルで実行：',
        code: 'ls /dev/tty*',
        expectedOutput: '/dev/tty   /dev/ttyS0   /dev/ttyUSB0   /dev/ttyUSB1',
        tip: '**ttyUSB0** と **ttyUSB1** の 2 行があなたの 2 本のアーム。他の `ttyS0` `tty` などはシステム標準で、あなたには無関係。'
      },
      {
        id: 'c2-08-permission',
        type: 'mcq',
        question:
          'さっきのコマンドを実行し、アームが一覧に出た。\n\nアクセスしようとすると、**エラー** ——\n\n```\nPermission denied: /dev/ttyUSB0\n```\n\nどうする？',
        options: [
          { id: 'reinstall', label: 'OS / ドライバを再インストール' },
          { id: 'sudo-always', label: '以後すべてのコマンドに sudo を付ける' },
          { id: 'add-group', label: '自分を dialout グループに追加し、再ログインする' },
          { id: 'change-cable', label: 'USB ケーブルを替える' }
        ],
        correctOptionId: 'add-group',
        explanation:
          '## dialout グループ = シリアル操作の権限\n\nLinux で `/dev/ttyUSB*` にアクセスするには `dialout` グループ（Ubuntu）または `uucp` グループ（Arch）に属する必要があります。\n\nあなたのアカウントは既定で**このグループにいない**ので拒否されます。修正 = このグループに入る。'
      },
      {
        id: 'c2-09-fix-permission',
        type: 'command',
        title: 'この権限エラーを直す',
        description: '一度直せば、以降は起動時に自動で権限あり：',
        code: 'sudo usermod -a -G dialout $USER',
        expectedOutput: '(出力が無ければ成功)',
        warning: '変更後は**必ずログアウトして再ログイン**しないと反映されません。または PC を再起動。再起動せず一時的になら `newgrp dialout`、ただし現在の shell でのみ有効。',
        tip: '反映確認：`groups` コマンドに dialout が並べばOK。'
      },
      {
        id: 'c2-10-dof',
        type: 'numeric',
        question: 'SO101 の 1 本のアームの**自由度**（独立して動く関節）はいくつ？',
        answer: 6,
        unit: '個',
        hint: '図で数える：土台の回転 1、肩 1、肘 1、手首 2、グリッパ 1。',
        explanation:
          '## ✅ 6 自由度\n\n産業用アームの「標準」自由度数 —— 6 つあれば末端（グリッパ）を**三次元空間の任意位置**（x, y, z）+ **任意姿勢**（pitch, yaw, roll）に到達させられます。\n\nこれが状態 s が 6 次元の理由 —— 1 関節 1 次元。2 本のデータを合わせると 12 次元。'
      },
      {
        id: 'c2-11-vocab',
        type: 'match',
        prompt: 'この課の 3 つの核心語を刻む：',
        pairs: [
          { left: 'Leader', right: 'あなたが手動操作するアーム' },
          { left: 'Follower', right: 'Leader の関節角を複製するアーム' },
          { left: '/dev/ttyUSB0', right: 'システム上でのアームのファイル名' }
        ]
      },
      {
        id: 'c2-12-recap',
        type: 'recap',
        title: '🧠 この課で分かったこと：',
        bullets: [
          '🦾 **SO101 は同じアームが 2 本** —— 役割はどの USB に挿すかで決まる',
          '👋 **Leader** は手動操作；**Follower** は Leader の関節角をリアルタイム複製',
          '📐 1 本のアームは **6 自由度** —— 状態/行動ベクトルが 6 次元の理由',
          '🔌 アームは Linux 上では `/dev/ttyUSB*` という「ファイル」',
          '🔑 `Permission denied` ➜ `sudo usermod -a -G dialout $USER` + 再ログイン'
        ]
      },
      {
        id: 'c2-13-completion',
        type: 'completion',
        title: '🎉 第 2 課クリア',
        body:
          'ハードウェアを知り、Leader-Follower の仕組みが分かりました。\n\n次の課からは**実際にソフトを入れていきます** —— 物理ハードが無くても完了できます。',
        nextChapterId: 3
      }
    ]
  },

  3: {
    chapterId: 3,
    title: 'LeRobot 環境を入れる',
    estimatedMinutes: 10,
    cards: [
      {
        id: 'c3-01-intro',
        type: 'intro',
        emoji: '💻',
        title: 'ハードウェアは一旦置いておく',
        body:
          'この課は**実機がまったく不要**。\n\nソフト環境を整えます —— 初学者の 8 割が詰まる所。一歩ずつ進めて、詰まらせません。',
        cta: 'はじめる →'
      },
      {
        id: 'c3-02-python-where',
        type: 'choice',
        question: 'Python をどこに入れる？',
        options: [
          {
            id: 'system',
            emoji: '💀',
            label: 'A. システム付属の Python にそのまま pip install',
            feedback:
              'やめましょう。システム Python は OS 自身が使うもの —— 無闇に入れると**システムを汚染**し、数日でランチャーが壊れます。Python 初学者の 9 割が最初に落ちる穴。\n\nC を見て →'
          },
          {
            id: 'venv',
            emoji: '🥈',
            label: 'B. Python 付属の venv を使う',
            feedback:
              'venv も使えますが、**Python パッケージだけを隔離**し、Python のバージョン自体は隔離しません。システムが 3.9 で LeRobot が 3.10 要求だと、結局詰まります。\n\nC のほうが堅実。'
          },
          {
            id: 'conda',
            emoji: '🥇',
            label: 'C. conda で完全に隔離した環境を作る',
            feedback:
              '✨ **正解**。\n\nconda はパッケージだけでなく **Python バージョン自体**も隔離します。システムが何のバージョンでも関係なく、conda が 3.10 を別に用意。壊れたら？　環境を削除して作り直し、**システムは無傷**。',
            correct: true
          }
        ]
      },
      {
        id: 'c3-03-stack-viz',
        type: 'viz',
        title: 'なぜ conda がこんなに効くのか',
        mermaid: `flowchart TB
    OS["💻 OS<br/>(Ubuntu / macOS)"]
    OS --> SysPy["🐍 システム Python 3.x<br/>(OS 自身が使う)"]
    OS --> Conda["📦 conda マネージャ"]
    Conda --> Env1["🟢 conda env: lerobot<br/>Python 3.10 + 100+ パッケージ"]
    Conda --> Env2["🟡 conda env: other<br/>Python 3.11 + 別のパッケージ"]
    style SysPy fill:#7f1d1d,stroke:#7f1d1d,color:#fff
    style Env1 fill:#15803d,stroke:#15803d,color:#fff`,
        caption: 'システム Python（赤）は**触らない**。conda が独立環境（緑）を作る —— 好きに入れて、壊れたら削除して作り直す。'
      },
      {
        id: 'c3-04-create-env',
        type: 'command',
        title: 'LeRobot 専用環境を作る',
        description: '1 行で完了：',
        code: 'conda create -n lerobot python=3.10 -y',
        expectedOutput:
          '...\nCollecting package metadata: done\n...\nPreparing transaction: done\nVerifying transaction: done\nExecuting transaction: done\n\n# To activate this environment, use\n#     $ conda activate lerobot',
        tip: '`-n lerobot` は環境名（以後の有効化で使う）。`python=3.10` でバージョン指定。`-y` は「確認せずそのまま入れる」。',
        warning: '**conda が無い**場合は、まず https://docs.conda.io/en/latest/miniconda.html から Miniconda を入れて（Anaconda は重いので不要）。'
      },
      {
        id: 'c3-05-install',
        type: 'command',
        title: '環境を有効化 + LeRobot を入れる',
        description: '有効化して、GitHub から直接：',
        code:
          'conda activate lerobot\ngit clone https://github.com/huggingface/lerobot.git\ncd lerobot\npip install -e .',
        expectedOutput:
          '(lerobot) $ \n... (ダウンロード + ビルドに約 3-5 分) ...\nSuccessfully installed lerobot torch numpy ...',
        tip: 'プロンプトの先頭に `(lerobot)` が付いた —— **今 lerobot 環境にいる**印。以後、新しいターミナルごとにまず `conda activate lerobot`。'
      },
      {
        id: 'c3-06-success-check',
        type: 'mcq',
        question: '`pip install -e .` がエラー無しで終わった。**これで成功？**',
        options: [
          { id: 'yes', label: 'はい —— エラーが無ければ成功' },
          { id: 'verify', label: '一概には言えない —— PyTorch が使えるか + CUDA（GPU があれば）を検証すべき' },
          { id: 'restart', label: 'はい —— ただし PC 再起動で反映' }
        ],
        correctOptionId: 'verify',
        explanation:
          '## 入った ≠ 使える\n\nLeRobot のインストール成功 ≠ 依存（PyTorch、CUDA）まで揃った、ではありません。**自分でコードを 1 行走らせて** PyTorch が使えるか、GPU が認識されるかを検証すべき。\n\n次のカードがその検証コマンド。'
      },
      {
        id: 'c3-07-verify',
        type: 'command',
        title: 'PyTorch + CUDA を検証',
        description: '1 行で 2 つを同時に検証：PyTorch が入った + GPU が使える：',
        code: 'python -c "import torch; print(torch.cuda.is_available())"',
        expectedOutput: 'True',
        tip: '**True** = 完璧、GPU 利用可。\n**False** = PyTorch は正しく入ったが、**GPU が見つからない**（GPU が無い、またはドライバ未導入）。'
      },
      {
        id: 'c3-08-no-cuda',
        type: 'choice',
        question: '上の検証が **False** を出した。どうする？',
        options: [
          {
            id: 'panic',
            label: 'A. 全部削除して入れ直す',
            feedback:
              '不要です。`False` は PyTorch の入れ間違いではなく、**使える GPU が見つからない**だけ。削除して入れ直しても同じ結果。\n\nB を見て →'
          },
          {
            id: 'cpu-ok',
            label: 'B. GPU が無くても動く、ただ遅いだけ',
            feedback:
              '✨ **正解**。\n\nLeRobot は自動で CPU にフォールバック。ACT の学習も CPU で動きますが約 **10〜30 倍**遅い。最初の 6 章（データ収集、推論）は CPU で十分。GPU が欲しいのは第 7 章の学習から。\n\n今は：気にせず先へ。',
            correct: true
          },
          {
            id: 'change-os',
            label: 'C. Linux 必須で Windows は不可',
            feedback:
              '実は Windows + WSL2 でも CUDA は動きます。macOS は CUDA 無しですが MPS（Apple 製 GPU 加速）あり。OS は本質ではありません。\n\nB を見て →'
          }
        ]
      },
      {
        id: 'c3-09-oom',
        type: 'mcq',
        question:
          '後で実際に学習を回すと、**ほぼ必ず**このエラーに出会います：\n\n```\nCUDA out of memory\n```\n\n真っ先に試すべきは？',
        options: [
          { id: 'reboot', label: 'PC を再起動' },
          { id: 'smaller-batch', label: 'batch_size を小さくする' },
          { id: 'buy-gpu', label: 'もっと VRAM の大きいカードに替える' },
          { id: 'restart-python', label: 'Python プロセスを再起動' }
        ],
        correctOptionId: 'smaller-batch',
        explanation:
          '## OOM ≈ batch が大きすぎ\n\nCUDA OOM の 9 割は batch_size 過大。GPU の VRAM がそれだけのサンプルを同時計算できません。\n\n**応急の三手：**\n1. `--batch_size=4`（まず batch を小さく、半分や 2 まで）\n2. 駄目なら余分なカメラを止め、入力画像の解像度を下げ、1 サンプルを小さく\n3. 駄目なら小さい policy に替えるか、VRAM の大きい GPU を借りる\n\n9 割は手順 1 で足ります。第 7 章で詳述。'
      },
      {
        id: 'c3-10-recap',
        type: 'recap',
        title: '🧠 あなたが達成したこと：',
        bullets: [
          '✅ **conda** を入れ、なぜシステム Python を使ってはいけないか分かった',
          '✅ **lerobot 環境**（Python 3.10）を作った',
          '✅ **LeRobot** 本体 + すべての依存を入れた',
          '✅ **PyTorch が使える**ことを検証した',
          '✅ **CUDA OOM** の応急策を先に知った'
        ]
      },
      {
        id: 'c3-11-completion',
        type: 'completion',
        title: '🎉 第 3 課クリア',
        body:
          '環境が整いました。この関門が 8 割を脱落させます —— あなたは突破した。\n\n次の課では PC に実機の 2 本の USB シリアルを**本当に認識させ**、重要な「キャリブレーション」を行います。',
        nextChapterId: 4
      }
    ]
  },

  4: {
    chapterId: 4,
    title: 'ポート識別 + アームのキャリブレーション',
    estimatedMinutes: 8,
    cards: [
      {
        id: 'c4-01-intro',
        type: 'intro',
        emoji: '🔌',
        title: '2 本の USB を挿した',
        body: 'PC が認識した。`ls /dev/tty*` で `ttyUSB0` と `ttyUSB1` も見える。\n\n**でもどちらが Leader でどちらが Follower か分からない。**',
        cta: 'どう見分ける？ →'
      },
      {
        id: 'c4-02-pull-one',
        type: 'command',
        title: '原始な手：1 本抜く',
        description: '最も簡単な見分け方 —— どのファイルが消えるか見る：',
        code: 'ls /dev/tty*\n# (次に Leader の USB を抜く)\nls /dev/tty*',
        expectedOutput:
          '1 回目:  ttyUSB0  ttyUSB1\n2 回目:  ttyUSB0           ← Leader は ttyUSB1',
        tip: '原始的だが**絶対確実**。最初に挿すとき Leader がどれかメモしておく。'
      },
      {
        id: 'c4-03-better-way',
        type: 'mcq',
        question: 'ケーブルを抜かず、手動で見ずに済む方法は？',
        options: [
          { id: 'gpt', label: 'ChatGPT に聞く' },
          { id: 'find-motors', label: 'LeRobot 付属の find_motors ツールで両ポートをスキャンして教えてもらう' },
          { id: 'guess', label: '勘（USB0 は普通 Leader）' },
          { id: 'sticker', label: '出荷前にメーカーにシールを貼ってもらう' }
        ],
        correctOptionId: 'find-motors',
        explanation:
          '## LeRobot 付属の探索ツール\n\nコマンドは `lerobot-find-port`。**各ポートに順に**「あなたは何番モータ？」と尋ね、どのポートがどのアームか教えてくれます。\n\n手動で抜く ✅ 簡単だが手を動かす  \nfind_motors ✅ 自動だがコマンドを覚える必要'
      },
      {
        id: 'c4-04-config',
        type: 'command',
        title: '結果をコマンド引数に書く',
        intro: 'どの ttyUSB がどの役割か分かったら、新版 LeRobot CLI 引数に書く：',
        description: '以降のコマンドにこの 2 つのポートを付ける：',
        code:
          '--robot.port=/dev/ttyACM0\n--teleop.port=/dev/ttyACM1',
        tip: '`--robot.port` は Follower ポート、`--teleop.port` は Leader ポート。以降のキャリブレーション・遠隔操作・録画もこの対応を使う。',
        warning: 'PC を再起動して挿し直すと ttyACM0 / ttyACM1 の順が入れ替わることがある。最も確実なのは先に `ls /dev/tty*` を実行して実ポートをコピー。'
      },
      {
        id: 'c4-05-calibrate-why',
        type: 'reveal',
        prompt:
          '2 本のアームが PC に認識された。\n\n**このまま学習を始められる？**\n\n答え：あと一歩。その一歩の名前は ——',
        revealCta: '明かす',
        reveal:
          '## キャリブレーション (Calibration) 🎯\n\nロボットアームは出荷時、**各モータの零点位置**に出荷誤差（機械的な組立公差）があります。\n\nつまり：「関節 1 を 30 度へ」と言っても、**実際**には 31 度や 28 度に行くことがある。\n\nキャリブレーション = PC に**「本当の 0 度」**が各モータの読み値でいくつかを教えること。\n\nキャリブレーションしないと ——\n- Follower が Leader を追従するとき**ずれる**\n- 録ったデモデータが**全部誤り**（Leader 読み値 ≠ Follower 実姿勢）\n- 学習したモデルは必ず崩れる\n\nだからこの一歩は**飛ばせません**。',
        followCta: 'キャリブレーション前後の差を見る →'
      },
      {
        id: 'c4-06-calibrate-viz',
        type: 'viz',
        title: 'キャリブレーション前 vs 後',
        mermaid: `flowchart LR
    subgraph Before ["未キャリブレーション"]
        B1["Leader 読み値: 30度"] -.->|"不一致!"| B2["Follower 実際: 33度"]
    end
    subgraph After ["キャリブレーション後"]
        A1["Leader 読み値: 30度"] -->|"完全一致 ✓"| A2["Follower 実際: 30度"]
    end
    style Before fill:#fef2f2,stroke:#dc2626
    style After fill:#f0fdf4,stroke:#16a34a`,
        caption: 'キャリブレーション前は Leader-Follower の角度に 1〜5 度のずれ。後は両者が完全一致。'
      },
      {
        id: 'c4-07-calibrate-cmd',
        type: 'command',
        title: 'キャリブレーションを実行',
        description: '1 コマンドでキャリブレーション開始：',
        code:
          'lerobot-calibrate \\\n  --robot.type=so101_follower \\\n  --robot.port=/dev/ttyACM0 \\\n  --robot.id=so101_follower',
        expectedOutput:
          'Calibrating leader_arms/main...\n[INFO] Move arm to fully-extended pose, press Enter...\n[INFO] Move arm to home pose, press Enter...\n[INFO] Saving calibration to ~/.cache/.../calibration.json\nDone!',
        tip: '一歩ずつ案内されます：アームを**手で指定姿勢**（完全伸展、零位など）に動かし、姿勢ごとに Enter。全体で 1〜2 分。',
        warning: '姿勢を作るときは**手でやさしく**。SO101 のモータはダンパが無く、無理に動かすとギアを傷める恐れ。'
      },
      {
        id: 'c4-08-calibrate-fail',
        type: 'mcq',
        question: 'キャリブレーション失敗の最も多い原因は？',
        options: [
          { id: 'cuda', label: 'CUDA が使えない' },
          { id: 'wrong-pose', label: '作った姿勢が不正確（「完全伸展」が実は伸び切っていない等）' },
          { id: 'wifi', label: 'Wi-Fi が遅い' },
          { id: 'python', label: 'Python バージョンが違う' }
        ],
        correctOptionId: 'wrong-pose',
        explanation:
          '## 物理姿勢の正確さ > ソフト設定\n\nキャリブレーションはあなたが作る物理姿勢を「基準点」にします。姿勢が不正確（「完全伸展」が実は 80%）だと、以降の読み値が全部ずれる。\n\n**修正**：キャリブレーションを再実行し、今度は**図に厳密に従って**姿勢を作る。定規で照合してもよい。\n\nキャリブレーションデータは `~/.cache/huggingface/lerobot/calibration/` に保存され、やり直すと旧いものが上書きされ、汚染しません。'
      },
      {
        id: 'c4-09-motor-count',
        type: 'numeric',
        question: 'SO101 の 1 本のアームは 6 関節。キャリブレーションでは**各関節を個別にキャリブレーション**します。\n\n1 本のアームで合計いくつのモータをキャリブレーションする？',
        answer: 6,
        unit: '個',
        hint: '関節数 = モータ数。',
        explanation:
          '## ✅ 6 個\n\n各関節に 1 モータ。2 本なら 12 個。\n\n朗報：スクリプトが**自動で 1 つずつ進める**ので、どのモータか手動選択は不要。'
      },
      {
        id: 'c4-10-when-recalibrate',
        type: 'choice',
        question: 'キャリブレーションは一度やったら、どれくらいで再実施？',
        options: [
          {
            id: 'never',
            label: 'A. 二度と不要 —— 一度で一生',
            feedback:
              '違います。アームを落とす、モータを一度分解組立、輸送の振動 —— どれも零点をずらし得ます。\n\nB を見て →'
          },
          {
            id: 'each-power-on',
            label: 'B. 起動のたびに再実施',
            feedback:
              '頻繁すぎ。キャリブレーションデータはディスクのファイルに保存され、電源を切っても消えません。\n\nC を見て →'
          },
          {
            id: 'on-change',
            label: 'C. ハードウェアに変動があったときだけ（モータ交換 / 再組立 / 落下）',
            feedback:
              '✨ **正解**。\n\nキャリブレーションデータは `~/.cache/.../calibration.json` にあり、ハードが動いていなければ次の起動でも有効。\n\nただし：モータ交換、分解組立、輸送の振動 —— があれば再実施を推奨。3 分で済む。',
            correct: true
          }
        ]
      },
      {
        id: 'c4-11-recap',
        type: 'recap',
        title: '🧠 この関門で身についたこと：',
        bullets: [
          '🔍 **ls /dev/tty\\*** でシリアルを見る',
          '⚙️ LeRobot 付属の **find_motors** ツールを知った',
          '📝 **--robot.port / --teleop.port** で 2 本のポートを明記',
          '🎯 **キャリブレーション** = 各モータの真の零点を PC に教える',
          '🔁 キャリブレーションは **ハードウェア変動時のみ**再実施'
        ]
      },
      {
        id: 'c4-12-completion',
        type: 'completion',
        title: '🎉 第 4 課クリア',
        body: 'ハードもソフトも準備完了。\n\n次の課は**全工程で一番楽しい部分** —— 実際にアームを持って動作を実演し、PC に録らせます。',
        nextChapterId: 5
      }
    ]
  },

  5: {
    chapterId: 5,
    title: '遠隔操作 + データ録画',
    estimatedMinutes: 12,
    cards: [
      {
        id: 'c5-01-intro',
        type: 'intro',
        emoji: '🎬',
        title: 'いよいよ楽しい部分',
        body: '今度は**自分の手で Leader を動かし**、Follower を追従させ、PC が同期して動作を録ります。\n\nこれが AI に見せる「デモデータ」です。',
        cta: '録画開始 →'
      },
      {
        id: 'c5-02-teleop-cmd',
        type: 'command',
        title: 'ステップ 1：まず純粋な遠隔操作を試す',
        intro: '録画せず、まず Leader → Follower の同期が正常に動くか検証。',
        description: 'このコマンドを実行：',
        code:
          'lerobot-teleoperate \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --display_data=true',
        expectedOutput: '[INFO] Connected to leader_arms/main\n[INFO] Connected to follower_arms/main\n[INFO] Teleoperation started. Move the leader arm.',
        tip: '手で Leader の関節を動かす → Follower が**同期して動く**はず。遅延 < 50ms が正常。\n\n30 秒試して手応えが良ければ Ctrl+C で終了。'
      },
      {
        id: 'c5-03-sync-feel',
        type: 'choice',
        question: 'Leader を動かすと Follower の追従に**明らかな遅延**や**ガタつき**。どうする？',
        options: [
          {
            id: 'higher-fps',
            label: 'A. fps を 60 に上げて追従を良くする',
            feedback:
              'fps を上げると逆にカクつくことも —— USB 帯域と計算が追いつかない。\n\nC を見て →'
          },
          {
            id: 'reboot',
            label: 'B. アームの電源を再起動',
            feedback:
              'たまに効くが根本解ではない。\n\nC を見て →'
          },
          {
            id: 'lower-fps',
            label: 'C. fps を 20〜30 にし、USB が hub に挿さっていないか確認',
            feedback:
              '✨ **正解**。\n\n**fps が高いほど帯域を食う**。30 fps が定番の手頃。低すぎると分割が見え、高すぎると USB が追いつかない。\n\nさらに：アームを**マザーボードの USB に直挿し**し、USB hub やドックを経由しない。遅延が大幅に下がる。',
            correct: true
          }
        ]
      },
      {
        id: 'c5-04-record-cmd',
        type: 'command',
        title: '実際に録画を始める',
        intro: 'Teleop の手応えが良ければ record モードへ。今回はデータを保存します。',
        description: '完全なコマンド：',
        code:
          'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --dataset.repo_id=your-name/so101-pick-cup \\\n  --dataset.num_episodes=50 --dataset.fps=30 \\\n  --display_data=true',
        expectedOutput:
          'Recording episode 1/50...\n[INFO] Press Enter when ready, Ctrl+C to abort.\nEpisode 1 saved (132 frames, 4.4 s)',
        tip: '`--dataset.repo_id` は自分で付けるデータセット名（任意、実際に HuggingFace へ上げる必要なし）。\n`--dataset.num_episodes` は録る総件数。\n`--dataset.fps` は頻度、30 推奨。'
      },
      {
        id: 'c5-05-how-many',
        type: 'mcq',
        question: '**単純なタスク**（コップの pick-and-place など）、何件デモを録れば足りる？',
        options: [
          { id: 'ten', label: '10 件 —— ACT は強いから足りるはず' },
          { id: 'fifty', label: '50 件 —— 一般に十分' },
          { id: 'hundred', label: '200 件以上 —— 多いほど良い' },
          { id: 'thousand', label: '1000 件 —— GPT のように大データが要る' }
        ],
        correctOptionId: 'fifty',
        explanation:
          '## 単純タスク ≈ 50 件\n\n経験則：\n\n- **単純な pick-place**：50 件で十分（10 件は過学習し、実機で数回しか通らない）\n- **中難度**（USB 挿入など）：100〜200 件\n- **複雑タスク**（タオル畳みなど）：300 件以上\n\n**質 > 量** —— **多様な** 50 件 > 同じに見える 200 件。次のカードで多様化を。'
      },
      {
        id: 'c5-06-same-or-vary',
        type: 'choice',
        question:
          '「コップを取る」デモを 50 件録る。**コップは毎回同じ位置に置く？　毎回少し変える？**',
        options: [
          {
            id: 'same',
            label: 'A. 毎回同じ位置 —— その方が「正確」に学べる',
            feedback:
              'ロボットは「X = 30 cm からコップを取る」を**正確に覚えます**。\n\nでも次にコップを X = 32 cm へ動かしたら？　**まったくできません**。これが**過学習**。\n\nB を見て →'
          },
          {
            id: 'vary',
            label: 'B. 毎回少し位置・角度・光を変える',
            feedback:
              '✨ **正解**。\n\n変化こそ汎化の鍵。6 件目はコップを左 1 cm、7 件目は後ろ 2 cm、15 件目はわざと手をゆっくり。\n\nこうした**自然な変化**が学習分布を広げ、少し違う状況でも崩れなくなる。',
            correct: true
          }
        ]
      },
      {
        id: 'c5-07-vary-detail',
        type: 'reveal',
        prompt: '具体的にどう「変える」？',
        revealCta: 'チェックリストを見る',
        reveal:
          '## 録画時の「意図的な変化」チェックリスト\n\n1. **物体位置**：毎回コップを少し違う位置に（±3〜5 cm）\n2. **物体の向き**：取っ手を左/右/手前、どれも録る\n3. **開始姿勢**：毎回「ホーム位置」から始めなくてよい\n4. **動作速度**：たまに遅く、たまに速く\n5. **環境**：別の時間帯（光が違う）で録る、机に邪魔物を置く\n6. **軽い失敗も録る**：コップを落として拾い直す、これも**価値あるデモ**（誤りからの回復を教える）\n\n**目標**：録った 50 件に、**まったく同じものが 2 件と無い**こと。',
        followCta: '次へ →'
      },
      {
        id: 'c5-08-frames',
        type: 'numeric',
        question: '30 fps で 5 秒のデモを 1 件録った。**このデモは合計何フレーム？**',
        answer: 150,
        unit: 'フレーム',
        hint: 'フレームレート × 秒数 = フレーム数。',
        explanation:
          '## ✅ 30 × 5 = 150 フレーム\n\n1 フレーム = 1 組の (s, a)。\n\nつまりこのデモは学習に **150 サンプル**を提供。5 秒のデモ 50 件で 50 × 150 = **7500 サンプル** —— ACT には十分。\n\nこれが、LeRobot が数百件のデモで学習できる理由。ChatGPT の数十億トークンよりずっと簡単。'
      },
      {
        id: 'c5-09-failed-episodes',
        type: 'mcq',
        question:
          '30 件目を録っていて、コップが滑って机に落ちた —— このタスクは**失敗**。このデモをどう扱う？',
        options: [
          { id: 'delete', label: '削除して、この 1 件を録り直す' },
          { id: 'mark', label: '残して**失敗としてマーク**' },
          { id: 'fix', label: '残すが、データを手動で成功に書き換える' },
          { id: 'all-delete', label: '前の 30 件も全部消してやり直す' }
        ],
        correctOptionId: 'mark',
        explanation:
          '## 失敗デモには**価値がある**\n\n残して失敗マーク：\n\n- モデルは「**この状況でこうしてはいけない**」という負信号を学べる\n- 完全に削除すると、失敗状態への事前知識をモデルが持てない\n\nただし比率は高すぎないこと。**失敗デモ < 20% が健全**、30% を超えると学習目標を汚染。\n\nLeRobot には押すと現在の episode を失敗としてマークするボタンが内蔵。'
      },
      {
        id: 'c5-10-push-hub',
        type: 'command',
        title: '（任意）データセットを HuggingFace Hub にアップロード',
        intro: '他人と共有、またはクラウドにバックアップしたい？　`--dataset.push_to_hub=true` フラグを付ける：',
        description: 'record コマンドに 1 行追加：',
        code:
          'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --dataset.repo_id=your-name/so101-pick-cup \\\n  --dataset.num_episodes=50 --dataset.fps=30 \\\n  --dataset.push_to_hub=true \\\n  --display_data=true',
        tip: '先に `huggingface-cli login` でログインが必要。**上げなくても全く問題なし**、ローカル学習はローカルのデータセットで OK。'
      },
      {
        id: 'c5-11-recap',
        type: 'recap',
        title: '🧠 できるようになったこと：',
        bullets: [
          '🎬 **teleoperate** コマンドで遠隔操作を試す',
          '📹 **record** コマンドで実際にデータを録る',
          '🔢 単純タスクは **~50 件**、複雑タスクは 100〜300 件',
          '🎲 **変化**が汎化を生む —— 同じものを 50 件録らない',
          '⚠️ **失敗デモも残す**、ただし比率 < 30%'
        ]
      },
      {
        id: 'c5-12-completion',
        type: 'completion',
        title: '🎉 第 5 課クリア',
        body: 'データを録れるようになりました。全工程で**一番大変だが一番重要**な一歩。\n\n次の課では、録ったデータセットを開けて**中身を一目見て**みます。',
        nextChapterId: 6
      }
    ]
  }
}

export function getLessonJa(chapterId: number): Lesson | null {
  return lessonsJa[chapterId] ?? null
}

export function hasLessonJa(chapterId: number): boolean {
  return chapterId in lessonsJa
}
