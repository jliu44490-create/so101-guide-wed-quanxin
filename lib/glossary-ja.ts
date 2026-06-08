import type { GlossaryTerm } from './types'

/**
 * Japanese mirror of glossary.
 * Keeps the same shape so JP pages can swap the import.
 */
export const glossaryJa: GlossaryTerm[] = [
  {
    term: '模倣学習',
    termEn: 'Imitation Learning (IL)',
    definition:
      '人間や専門家の動作を観察してロボットに行動を学ばせる枠組み。本質的には「状態 → 行動」の写像を学習することにあり、行動クローニング (BC)、逆強化学習 (IRL)、ACT などが含まれます。',
    category: 'concept',
    related: ['行動クローニング', 'ACT', '逆強化学習']
  },
  {
    term: '行動クローニング',
    termEn: 'Behavior Cloning (BC)',
    definition:
      '最も基本的な模倣学習手法。専門家のデモを教師ラベルとして扱い、各ステップの行動を直接予測するネットワークを学習させます。実装は簡単ですが、複合誤差により破綻しやすい欠点があります。',
    category: 'algorithm',
    related: ['模倣学習', 'ACT']
  },
  {
    term: 'ACT',
    termEn: 'Action Chunking Transformer',
    definition:
      'Stanford が提案した模倣学習アルゴリズム。Transformer + CVAE で複数ステップ分の行動 (action chunk) を一度に予測することで、複合誤差と振動を大幅に低減します。LeRobot 既定の方式です。',
    category: 'algorithm',
    related: ['CVAE', 'Transformer', 'Action Chunking']
  },
  {
    term: 'CVAE',
    termEn: 'Conditional Variational Autoencoder',
    definition:
      '条件付き変分オートエンコーダ。同じ状態でも複数の合理的な行動があり得るというデモのマルチモーダル性を、潜在変数 z を通じて表現できるよう ACT に組み込まれています。',
    category: 'algorithm',
    related: ['ACT', 'マルチモーダル']
  },
  {
    term: 'Action Chunking',
    termEn: 'Action Chunking',
    definition:
      'ポリシーが未来 k ステップ分の行動 (例: 100 ステップ) を一度に出力する手法。time ensembling で平滑化を行い、ACT が BC を上回る最大の理由となっています。',
    category: 'concept',
    related: ['ACT', '複合誤差']
  },
  {
    term: '遠隔操作',
    termEn: 'Teleoperation',
    definition:
      'Leader アームを人が手動で動かし、Follower アームがその関節角度をリアルタイムで追従する操作方式。SO101 で学習データを収集するための基本手段です。',
    category: 'concept',
    related: ['Leader/Follower', 'データ収集']
  },
  {
    term: 'Leader / Follower',
    termEn: 'Leader / Follower Arm',
    definition:
      'マスター・スレーブ構成。Leader は人が直接操作し、Follower は PID もしくは直接位置制御で Leader の関節角度を再現します。両者は同じハードでも役割が異なります。',
    category: 'hardware',
    related: ['遠隔操作', 'キャリブレーション']
  },
  {
    term: 'LeRobot',
    termEn: 'LeRobot',
    definition:
      'HuggingFace が公開しているロボット学習フレームワーク。データ収集・学習・推論の 3 工程を統合し、SO100 / SO101、Aloha、Koch、Stretch など多様なロボットアームに対応します。',
    category: 'framework',
    related: ['ACT', 'HuggingFace Hub']
  },
  {
    term: 'SO101 / SO-ARM100',
    termEn: 'SO-100 Arm',
    definition:
      'TheRobotStudio による低コスト 6 自由度ロボットアーム構想。BOM は約 100 米ドルで、身体性 AI と LeRobot 模倣学習の入門に最適なハードウェアの一つです。',
    category: 'hardware',
    related: ['LeRobot', 'Leader/Follower']
  },
  {
    term: 'キャリブレーション',
    termEn: 'Calibration',
    definition:
      '既知姿勢における各モータの読み値を記録し、零点の基準とする作業。キャリブレーションがずれると Leader / Follower の追従に明確な偏差が生じ、学習データの品質も損なわれます。',
    category: 'concept',
    related: ['Leader/Follower', 'SO101 / SO-ARM100']
  },
  {
    term: 'LeRobot Dataset',
    termEn: 'LeRobot Dataset Format',
    definition:
      'parquet + 動画 + meta/info.json から構成されるデータフォーマット。各エピソードの関節状態、行動、カメラフレーム、タイムスタンプを含み、LeRobotDataset クラスから直接ロードできます。',
    category: 'data',
    related: ['HuggingFace Hub', 'parquet']
  },
  {
    term: 'HuggingFace Hub',
    termEn: 'HuggingFace Hub',
    definition:
      'モデル・データセット・Space をホスティングする中央リポジトリ。LeRobot のデータセットを push しておくと、共有と再現が容易になります。',
    category: 'framework',
    related: ['LeRobot Dataset', 'LeRobot']
  },
  {
    term: '複合誤差',
    termEn: 'Compounding Error',
    definition:
      '行動クローニングが抱える中心的な課題。各ステップで生じた予測のずれが次ステップの入力をさらに学習分布から外し、誤差が雪だるま式に累積していきます。Action Chunking や time ensembling が緩和策として知られます。',
    category: 'concept',
    related: ['Action Chunking', '行動クローニング']
  },
  {
    term: 'EMA 平滑化',
    termEn: 'Exponential Moving Average Smoothing',
    definition:
      '推論時によく用いられるフィルタ手法。直前ステップの行動と現在の行動を重み付け融合 (例: 0.7 / 0.3) することで、高周波の振動を抑制します。',
    category: 'concept',
    related: ['Action Chunking', '複合誤差']
  },
  {
    term: 'CUDA / AMP',
    termEn: 'CUDA / Automatic Mixed Precision',
    definition:
      'CUDA は NVIDIA GPU の汎用計算 API。AMP は PyTorch が提供する自動混合精度学習で、VRAM 使用量を抑えつつ学習を高速化できます。',
    category: 'framework'
  },
  {
    term: 'Hydra 設定',
    termEn: 'Hydra Config',
    definition:
      'Facebook が公開した設定管理フレームワーク。LeRobot は Hydra を用いて学習パラメータを管理しており、`--dataset.repo_id=... --policy.type=act` のようにコマンドラインから設定を上書きできます。',
    category: 'framework'
  }
]

export const glossaryCategoriesJa = [
  { id: 'all', label: 'すべて' },
  { id: 'concept', label: '概念' },
  { id: 'algorithm', label: 'アルゴリズム' },
  { id: 'hardware', label: 'ハードウェア' },
  { id: 'framework', label: 'フレームワーク' },
  { id: 'data', label: 'データ' }
] as const
