import type { Resource } from './types'

export const resourcesJa: Resource[] = [
  {
    title: 'LeRobot 公式リポジトリ',
    description: 'HuggingFace 公式のロボット学習ライブラリ。ソース、ドキュメント、サンプルが揃っています。',
    url: 'https://github.com/huggingface/lerobot',
    category: 'code',
    tags: ['LeRobot', '公式']
  },
  {
    title: 'SO-ARM100 ハードウェアプロジェクト',
    description: 'SO101 ロボットアームのハードウェア設計資料：BOM、3D プリント部品、組立ガイド。',
    url: 'https://github.com/TheRobotStudio/SO-ARM100',
    category: 'hardware',
    tags: ['SO101', 'BOM', '3D プリント']
  },
  {
    title: 'ACT 原論文',
    description: 'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (Zhao et al. 2023)',
    url: 'https://arxiv.org/abs/2304.13705',
    category: 'paper',
    tags: ['ACT', 'CVAE', '論文']
  },
  {
    title: 'ALOHA プロジェクトサイト',
    description: 'ACT が初めて発表された双腕遠隔操作プラットフォーム。Action Chunking 誕生の背景が分かります。',
    url: 'https://tonyzhaozh.github.io/aloha/',
    category: 'paper',
    tags: ['ALOHA', 'ACT']
  },
  {
    title: 'HuggingFace LeRobot モデルハブ',
    description: '公開済みの事前学習ポリシー、コミュニティ提供のデータセットを直接ダウンロードできます。',
    url: 'https://huggingface.co/lerobot',
    category: 'docs',
    tags: ['HuggingFace', 'モデル', 'データセット']
  },
  {
    title: 'LeRobot 入門動画シリーズ',
    description: 'HuggingFace 公式が公開している LeRobot のクイックスタート動画シリーズ。',
    url: 'https://www.youtube.com/playlist?list=PL3vV3-eqf-bp9DvB7-EkS8DGHE9pXVKlS',
    category: 'video',
    tags: ['動画', '入門']
  },
  {
    title: 'Discord · HuggingFace ロボティクスチャンネル',
    description: '公式コミュニティ。LeRobot チームと開発者が issue や新機能について議論しています。',
    url: 'https://discord.gg/huggingface',
    category: 'community',
    tags: ['Discord', 'コミュニティ']
  },
  {
    title: 'OpenAI Cookbook · Robotics',
    description: 'LLM とロボットを組み合わせるための実践ノート。ポリシー学習サンプルも複数含まれています。',
    url: 'https://github.com/openai/openai-cookbook',
    category: 'code',
    tags: ['LLM', 'cookbook']
  },
  {
    title: 'DROID データセット',
    description: '76,000 件規模のマルチタスク・ロボットアーム遠隔操作データ。模倣学習向けの公開データセットでは最大級の規模を誇ります。',
    url: 'https://droid-dataset.github.io/',
    category: 'docs',
    tags: ['データセット', 'DROID']
  },
  {
    title: 'PyTorch Mixed Precision ガイド',
    description: '公式 AMP チュートリアル。VRAM が逼迫した際の必読資料です。',
    url: 'https://pytorch.org/docs/stable/amp.html',
    category: 'docs',
    tags: ['PyTorch', 'AMP']
  },
  {
    title: 'Hydra 設定ドキュメント',
    description: 'LeRobot は設定管理に Hydra を採用しています。理解すると学習スクリプトの設定の柔軟性が高まります。',
    url: 'https://hydra.cc/docs/intro/',
    category: 'docs',
    tags: ['Hydra']
  },
  {
    title: 'Weights & Biases (wandb)',
    description: '学習モニタリング、ハイパーパラメータ比較、モデルバージョン管理に欠かせないツールです。',
    url: 'https://wandb.ai/',
    category: 'docs',
    tags: ['wandb', '可視化']
  }
]

export const resourceCategoriesJa = [
  { id: 'all', label: 'すべて' },
  { id: 'paper', label: '論文' },
  { id: 'docs', label: 'ドキュメント' },
  { id: 'video', label: '動画' },
  { id: 'community', label: 'コミュニティ' },
  { id: 'hardware', label: 'ハードウェア' },
  { id: 'code', label: 'コード' }
] as const
