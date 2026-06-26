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
  }
}

export function getLessonJa(chapterId: number): Lesson | null {
  return lessonsJa[chapterId] ?? null
}

export function hasLessonJa(chapterId: number): boolean {
  return chapterId in lessonsJa
}
