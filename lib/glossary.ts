import type { GlossaryTerm } from './types'

export const glossary: GlossaryTerm[] = [
  {
    term: '模仿学习',
    termEn: 'Imitation Learning (IL)',
    definition:
      '让机器人通过观察人类或专家的演示来学习行为，本质是从「状态 → 动作」的映射中学习策略。包括行为克隆 (BC)、逆强化学习 (IRL) 与 ACT 等。',
    category: 'concept',
    related: ['行为克隆', 'ACT', '逆强化学习']
  },
  {
    term: '行为克隆',
    termEn: 'Behavior Cloning (BC)',
    definition:
      '最基本的模仿学习方法。把专家演示当作监督学习的标注数据，直接训练一个网络去预测每一步的动作。简单但容易因为复合误差 (compounding error) 而崩溃。',
    category: 'algorithm',
    related: ['模仿学习', 'ACT']
  },
  {
    term: 'ACT',
    termEn: 'Action Chunking Transformer',
    definition:
      'Stanford 提出的模仿学习算法。用 Transformer + CVAE 一次性预测多步动作 (action chunk)，显著降低复合误差与抖动。LeRobot 默认就是 ACT 实现。',
    category: 'algorithm',
    related: ['CVAE', 'Transformer', 'Action Chunking']
  },
  {
    term: 'CVAE',
    termEn: 'Conditional Variational Autoencoder',
    definition:
      '条件变分自编码器。ACT 用它建模演示的多模态分布——同一个状态可能有多种合理动作，CVAE 通过 latent z 让模型不至于把它们平均到一起。',
    category: 'algorithm',
    related: ['ACT', '多模态']
  },
  {
    term: 'Action Chunking',
    termEn: 'Action Chunking',
    definition:
      '让策略一次输出 k 步未来动作 (例如 100 步)，再用时间集成 (temporal ensembling) 平滑，是 ACT 显著优于 BC 的关键。',
    category: 'concept',
    related: ['ACT', '复合误差']
  },
  {
    term: '遥操作',
    termEn: 'Teleoperation',
    definition:
      'Leader 臂被人手动操作，Follower 臂实时跟随它的关节角度。这是 SO101 采集训练数据的基本方式。',
    category: 'concept',
    related: ['Leader/Follower', '数据采集']
  },
  {
    term: 'Leader / Follower',
    termEn: 'Leader / Follower Arm',
    definition:
      '主从臂结构。Leader 由人操作，Follower 用 PID 或直接位置控制实时复现 Leader 的关节角度。两条臂硬件相同但角色不同。',
    category: 'hardware',
    related: ['遥操作', '校准']
  },
  {
    term: 'LeRobot',
    termEn: 'LeRobot',
    definition:
      'HuggingFace 推出的机器人学习框架，整合了数据采集、训练、推理三大环节，支持 SO100/SO101、Aloha、Koch、Stretch 等多种机械臂。',
    category: 'framework',
    related: ['ACT', 'HuggingFace Hub']
  },
  {
    term: 'SO101 / SO-ARM100',
    termEn: 'SO-100 Arm',
    definition:
      'TheRobotStudio 推出的低成本 6 自由度机械臂方案，BOM 大约 100 美元，是入门具身智能与 LeRobot 模仿学习的最佳硬件之一。',
    category: 'hardware',
    related: ['LeRobot', 'Leader/Follower']
  },
  {
    term: '校准',
    termEn: 'Calibration',
    definition:
      '记录机械臂在已知姿态下每个电机的读数，作为零点参考。校准不准会导致 Leader/Follower 跟随发生明显偏差，也会让训练数据失真。',
    category: 'concept',
    related: ['Leader/Follower', 'SO101 / SO-ARM100']
  },
  {
    term: 'LeRobot Dataset',
    termEn: 'LeRobot Dataset Format',
    definition:
      '基于 parquet + 视频 + meta/info.json 的数据格式。包含每集 (episode) 的关节状态、动作、相机帧、时间戳，可直接被 LeRobotDataset 类加载。',
    category: 'data',
    related: ['HuggingFace Hub', 'parquet']
  },
  {
    term: 'HuggingFace Hub',
    termEn: 'HuggingFace Hub',
    definition:
      '托管模型、数据集、Space 的中心仓库。LeRobot 数据集可以 push 到 Hub，方便分享与复现。',
    category: 'framework',
    related: ['LeRobot Dataset', 'LeRobot']
  },
  {
    term: '复合误差',
    termEn: 'Compounding Error',
    definition:
      '行为克隆的核心问题——每一步预测偏差会让下一步的输入更偏离训练分布，错误像滚雪球一样累积。Action Chunking 与时间集成是缓解手段。',
    category: 'concept',
    related: ['Action Chunking', '行为克隆']
  },
  {
    term: 'EMA 平滑',
    termEn: 'Exponential Moving Average Smoothing',
    definition:
      '推理时常用的滤波技巧：把当前动作与上一时刻动作按权重融合 (例如 0.7 / 0.3)，抑制高频抖动。',
    category: 'concept',
    related: ['Action Chunking', '复合误差']
  },
  {
    term: 'CUDA / AMP',
    termEn: 'CUDA / Automatic Mixed Precision',
    definition:
      'NVIDIA GPU 通用计算 API；AMP 是 PyTorch 提供的自动混合精度训练，可显著降低显存占用并加速训练。',
    category: 'framework'
  },
  {
    term: 'Hydra 配置',
    termEn: 'Hydra Config',
    definition:
      'Facebook 推出的配置框架，LeRobot 用它管理训练参数。你可以在命令行用 --dataset.repo_id=... --policy.type=act 的方式覆写配置。',
    category: 'framework'
  }
]

export const glossaryCategories = [
  { id: 'all', label: '全部' },
  { id: 'concept', label: '概念' },
  { id: 'algorithm', label: '算法' },
  { id: 'hardware', label: '硬件' },
  { id: 'framework', label: '框架' },
  { id: 'data', label: '数据' }
] as const
