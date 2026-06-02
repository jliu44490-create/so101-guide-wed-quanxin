import type { Chapter, DiagnosticResult } from './types'

export const chapters: Chapter[] = [
  {
    id: 1,
    title: '什么是模仿学习',
    titleEn: 'What is Imitation Learning',
    description: '从「为什么不直接用强化学习」开始，建立对模仿学习的直觉。读完这一章，你能解释 BC、ACT 是什么，知道为什么 100 美元级硬件 + 模仿学习是 2023 年以来机器人圈的主流路径。',
    duration: '25 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '能用一句话解释「模仿学习」和「强化学习」的本质区别',
      '理解状态 s 和动作 a 在 SO101 上具体是什么',
      '能解释 BC 为什么会失败，以及 ACT 解决了什么',
      '判断一个任务是否适合用模仿学习来做'
    ],
    principles: [
      '模仿学习 = 监督学习 + 演示数据，目标是学一个策略 π(s) → a',
      '行为克隆 (BC) 是最朴素的实现，会因复合误差累积而崩溃',
      '现代方法 (ACT、Diffusion Policy) 通过预测动作序列而非单步动作来缓解复合误差',
      'SO101 上的 (s, a) = (6 维关节角度, 6 维目标角度) + 相机帧'
    ],
    steps: [
      { title: '理解状态与动作', content: 'SO101 的状态是 6 维关节角度向量，动作是 6 维目标角度向量' },
      { title: '理解什么是策略', content: '策略 π_θ 就是一个把 s 映射到 a 的神经网络' },
      { title: '理解为什么 BC 不够', content: '复合误差让长序列任务越往后越歪，ACT 用动作序列预测缓解' }
    ],
    commands: [],
    checkpoints: [
      '能用自己的话讲清楚 IL 和 RL 在数据来源上的根本区别',
      '能算出一段 7 秒、30 Hz 演示在 SO101 上有多少个 (s, a) 样本',
      '能解释为什么模仿学习也需要相机',
      '能判断「折毛巾」「双足平衡」哪个适合 IL'
    ],
    errors: [],

    // === Rich content begins here ===

    introduction: `想象你想教一个机器人把杯子从桌上拿起来。

你有两种思路：

1. **告诉它怎么算「成功」**，然后让它自己瞎试几万次，从奖励里慢慢摸出来。这是 **强化学习 (Reinforcement Learning, RL)**。
2. **直接演示给它看几十遍**，让它照着学。这是 **模仿学习 (Imitation Learning, IL)**。

在真实物理世界里，第一种几乎不可行 —— 撞坏一台机械臂要几千美元，「瞎试几万次」意味着烧成本。所以从 2020 年开始，机器人领域开始大规模回归模仿学习，特别是在精细操作（pick-and-place、装配、抓握）上。

模仿学习的核心数学其实只有一句话：

> 给定大量 **(状态 s, 动作 a)** 的人类演示对，学一个策略 π(s) → a，让它在没见过的状态下也能给出合理的动作。

听起来像监督学习？是的 —— 最朴素的版本就是把它当监督学习做，叫 **行为克隆 (Behavior Cloning, BC)**。但 BC 有一个臭名昭著的问题叫 **复合误差 (compounding error)**：每一步预测稍微偏一点，下一步的输入就更偏离训练分布，错误像滚雪球。

现代模仿学习（ACT、Diffusion Policy）的核心创新都是在解决这个滚雪球。本站后续 8 章，会带你完整走一遍 ACT 在 SO101 上的实现路径。`,

    whyItMatters: `你为什么应该认真学这个？

模仿学习目前是 **唯一一个被广泛验证能在 100 美元级硬件上跑通真实操作任务** 的方法。HuggingFace LeRobot 团队、Stanford ALOHA、Tesla Optimus 全在用类似框架。学会它之后：

- 你可以自己采 50–100 条数据，训练一个能跑通特定任务的策略；
- 你能用相同代码做「折毛巾」「插 USB」「开柜门」这类不同任务；
- 你能复现 2023–2025 年大部分顶会论文里的核心 pipeline。`,

    keyTerms: ['模仿学习', '行为克隆', 'ACT', '遥操作', '复合误差'],

    diagrams: [
      {
        title: '模仿学习标准 pipeline',
        source: `flowchart LR
    A["人类专家"] -->|"演示 N 条轨迹"| B["数据集 (s, a)"]
    B -->|"监督学习"| C["策略 π_theta"]
    C -->|"s -> a"| D["机械臂"]
    D -.->|"新状态 s'"| C
    style A fill:#7c5cff,stroke:#7c5cff,color:#fff
    style C fill:#22c55e,stroke:#22c55e,color:#fff
    style D fill:#0ea5e9,stroke:#0ea5e9,color:#fff`,
        caption: '专家通过演示提供监督信号，策略学一个「看到 s 就输出 a」的映射。注意环路：机械臂执行后产生新状态，又喂回策略。'
      },
      {
        title: '强化学习 vs 模仿学习的数据来源对比',
        source: `flowchart TB
    subgraph RL ["强化学习 RL"]
        direction LR
        R1["随机动作"] --> R2["环境反馈奖励 r"]
        R2 --> R3["更新策略"]
        R3 --> R1
    end
    subgraph IL ["模仿学习 IL"]
        direction LR
        I1["专家演示"] --> I2["数据集 (s, a)"]
        I2 --> I3["监督学习"]
        I3 --> I4["策略"]
    end`,
        caption: 'RL 靠「试错+奖励」循环，需要大量真实交互；IL 一次性吃掉演示数据，训练流程跟图像分类几乎一样。'
      }
    ],

    walkthrough: [
      {
        title: '理解状态 s 与动作 a',
        body: `在 SO101 上，状态 s 是一个 6 维向量 [θ₁, θ₂, ..., θ₆]，每个 θᵢ 是一个关节的当前角度。动作 a 也是一个 6 维向量，但它表示「下一时刻你想让每个关节去到的角度」。

所以一条演示轨迹是一串 (s_t, a_t) 对，按 30 Hz 采样的话，一段 5 秒的操作就有 150 对样本。

在 LeRobot 的 parquet 文件里：

- s 叫 \`observation.state\`
- a 叫 \`action\`

你打开数据集就能直接看到这两个字段。`,
        tip: '后面第 6 章会真的打开 parquet 看一眼，到时候这一节的内容会变得非常具体。'
      },
      {
        title: '理解什么是策略 π',
        body: `策略 π 就是一个函数 —— 输入 s，输出 a。在深度学习里它就是一个神经网络，参数叫 θ。训练的目标是找到一组 θ，让 π_θ(s) 尽可能接近专家演示里的 a。

最朴素的损失函数就是均方误差 (MSE)：

\`\`\`
L = ||π_θ(s) - a_expert||²
\`\`\`

只看这个公式的话，模仿学习和图像分类几乎一样 —— 都是「监督信号 + 反向传播」。差别在于输入的维度和输出的语义。`,
        tip: '在 ACT 里这个函数不再是「看一帧出一个动作」，而是「看一帧出未来 100 步的动作序列」。这是 Action Chunking 的核心。第 7 章会展开。'
      },
      {
        title: '理解 BC 为什么不够',
        body: `想象你正在开车，方向盘比理想位置偏了 1 度。

下一秒你看到的画面是一个稍微偏左的车道 —— 这个画面跟训练数据里「专家正常开车」的画面已经不太一样了。如果你的策略只学过「专家正常开车」的画面，它在偏离的画面下会做出更糟糕的预测。

下下秒，画面偏得更厉害。再往下，策略彻底懵了。

这就是 **复合误差 (compounding error)**：每一步的小偏差累积起来，让输入分布越来越远离训练分布。`,
        warning: '这个问题在长序列任务（>10 秒）上尤其严重，你会观察到机器人前几秒动作很顺，越往后越歪。Action Chunking + Time Ensembling 是目前最有效的缓解方案，第 7-8 章会讲。'
      }
    ],

    pitfalls: [
      {
        symptom: '「模仿学习就是抄答案，没什么技术含量。」',
        cause: '把「模仿」当成了字面意思的复制粘贴。',
        fix: '真正的难点不在数据采集，而在让策略 **泛化到没见过的状态**。一个能背 50 条演示的策略毫无价值 —— 你要的是一个能应对环境扰动（光照变化、物体位置稍偏、初始姿态不同）的策略。这是 IL 跟监督图像分类最大的区别。'
      },
      {
        symptom: '「我做了 10 条演示，模型怎么学不会？」',
        cause: '数据量严重不足，且演示之间过于一致（没有覆盖足够的状态空间）。',
        fix: '一般规则：简单 pick-and-place 任务起码 50 条，复杂任务（比如插 USB）需要 200+ 条。而且要刻意做出「不同初始位置 / 不同抓取角度 / 偶尔失败后重试」的演示，让训练分布足够宽。'
      },
      {
        symptom: '「模仿学习就够了，不需要 RL。」',
        cause: '没看到 IL 的能力边界。',
        fix: 'IL 的能力上限就是「专家演示的水平 + 一点泛化」。如果任务本身需要超越人类反应速度（高速接球、复杂规划），或者人类自己也演示得很差（双足平衡），那 RL 或 IL+RL 混合才是正路。'
      }
    ],

    exercises: [
      {
        title: '状态/动作维度推算',
        instructions: `SO101 有 6 个关节。如果你以 30 Hz 采集一段 7 秒的演示：

1. 会得到多少个 (s, a) 样本对？
2. 每对的总维度（s 维度 + a 维度）是多少？
3. 整段演示的浮点数总量是多少？（按 float32 算）`,
        hint: '样本数 = fps × 秒数。每对维度 = 状态维度 + 动作维度。',
        expectedResult: `1. **210 个样本对**（30 × 7）
2. **12 维**（6 + 6）
3. **210 × 12 = 2520 个 float32 ≈ 10 KB**

这就是为什么 LeRobot 数据集即使存几千条演示也只有几百 MB —— 状态/动作本身是低维数据，真正占空间的是相机视频帧。`
      },
      {
        title: '思考题：为什么模仿学习需要相机？',
        instructions: `既然 SO101 已经能精确读取每个关节的角度，理论上「状态 s = 关节角度」就已经完整描述了机械臂自己的姿态。

为什么所有现代模仿学习算法（包括 ACT）还必须配相机？`,
        hint: '想想「机械臂的姿态」和「环境的状态」的区别。',
        expectedResult: `关节角度只描述了机械臂 **自身**，不包含 **任务环境** 的信息 —— 杯子在哪？桌子哪里有障碍物？目标物有没有被移走？

相机给的是 **环境的视觉状态**。没有相机，策略只能学到「复读机式」的固定动作序列，无法对环境变化做出反应。

这也是为什么 ACT 的策略输入是「关节状态 + 一帧或多帧图像」的拼接。`
      }
    ],

    selfCheck: [
      {
        question: '行为克隆（BC）和模仿学习（IL）是不是一回事？',
        answer: '**不是。** BC 是 IL 的最朴素实现方法之一。IL 是大方向 —— 所有「从演示中学策略」的方法都叫 IL，包括 BC、逆强化学习 (IRL)、ACT、Diffusion Policy 等。BC 只是其中「用监督学习直接拟合 (s, a)」的一类。'
      },
      {
        question: '为什么模仿学习适合机械臂，但不适合自动驾驶？',
        answer: `适合机械臂是因为：

1. 物理交互安全可控，演示成本低
2. 任务空间相对封闭，演示能覆盖大部分情况

自动驾驶在 corner case 上几乎不可能用纯模仿学习 —— 你没法演示「前方突然出现儿童」的所有变体，必须配合规则系统 + 仿真 RL。`
      },
      {
        question: 'ACT 比 BC 强在哪？用一句话总结。',
        answer: 'ACT 一次预测一段连续动作而不是单步，把「复合误差累积」的问题转化成了「短段内可以容忍误差」的问题。'
      },
      {
        question: '如果我的演示数据里有 10% 是失败的（比如杯子掉了），应该删掉还是保留？',
        answer: `一般推荐 **保留 + 标注**。

失败案例提供了「什么不该做」的负信号；完全删掉会让策略对失败状态没有任何先验，反而泛化更差。

但比例不能太高，超过 30% 的失败演示会污染学习目标。`
      }
    ],

    furtherReading: [
      {
        title: 'Imitation Learning: A Survey of Learning Methods (Hussein et al. 2017)',
        url: 'https://arxiv.org/abs/1709.07820',
        note: 'IL 领域的经典综述，扫一眼能建立全局观。'
      },
      {
        title: 'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (Zhao et al. 2023)',
        url: 'https://arxiv.org/abs/2304.13705',
        note: 'ACT 原论文。先不用读懂全部数学，看一下实验视频和方法概览就够。'
      },
      {
        title: 'LeRobot 官方介绍博客',
        url: 'https://huggingface.co/blog/lerobot',
        note: 'HuggingFace 团队对 LeRobot 的产品级介绍，对接下来 8 章的代码理解很有帮助。'
      }
    ],

    summary: `**模仿学习 = 从专家演示里学策略。** 最朴素的方法是 BC（监督学习套 (s, a) 对），但有复合误差问题。ACT 通过「一次预测一段动作」缓解了它。

SO101 上的状态是 6 维关节角度，动作是 6 维目标角度，再加相机帧。

下一章我们打开 SO101 的硬件，看 Leader/Follower 怎么生成这些 (s, a) 对。`
  },
  {
    id: 2,
    title: 'SO101 硬件与 Leader/Follower 结构',
    titleEn: 'SO101 Hardware & Leader/Follower',
    description: '认识 SO101 机械臂硬件结构、串口连接和 Leader-Follower 工作模式',
    duration: '20 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '了解 SO101 机械臂的硬件组成',
      '理解 Leader-Follower 双臂协作模式',
      '掌握串口连接和识别方法'
    ],
    principles: [
      'SO101 是低成本 6 自由度机械臂，适合模仿学习研究',
      'Leader 臂由人类操作，Follower 臂实时跟随',
      '通过 USB 串口与电脑通信，每个电机有独立 ID'
    ],
    steps: [
      { title: '硬件检查', content: '确认机械臂各关节电机正常，线缆连接牢固' },
      { title: '串口识别', content: '使用 ls /dev/tty* 命令查看可用串口设备' },
      { title: '双臂配置', content: '分别配置 Leader 和 Follower 臂的端口' }
    ],
    commands: [
      { description: '查看串口设备', code: 'ls /dev/tty*' },
      { description: '查看 USB 设备信息', code: 'lsusb' },
      { description: '查看串口详细信息', code: 'dmesg | grep tty' }
    ],
    checkpoints: [
      '能够识别 Leader 和 Follower 的串口',
      '理解双臂协作的工作原理',
      '完成硬件连接检查'
    ],
    errors: [
      {
        error: 'Permission denied: /dev/ttyUSB0',
        cause: '当前用户没有串口访问权限',
        solution: '将用户添加到 dialout 组',
        command: 'sudo usermod -a -G dialout $USER'
      }
    ],

    introduction: `你订的机械臂到了，拆开箱子 —— 里面是**两条**一模一样的机械臂，不是一条。

一开始很多人会愣住：为什么是两条？哪条是哪条？

答案是 SO101 的核心设计：**一条给你手动操作（Leader / 主臂），另一条实时复制你的动作（Follower / 从臂）**。你拿着 Leader 演示「怎么拿杯子」，电脑一边让 Follower 跟着动给你看效果，一边把 Leader 每一刻的关节角度记录下来 —— 这些记录就是第 1 章说的 (s, a) 演示数据。

这一章我们把硬件彻底搞清楚：6 个关节是什么、两条臂怎么连电脑、怎么在系统里认出它们、以及第一个一定会撞上的权限报错怎么修。`,

    whyItMatters: `**搞不清硬件，后面每一步都会卡。**

- 不知道哪条是 Leader、哪条是 Follower → 第 4 章配置端口时一头雾水
- 不理解"角色由接线决定" → 重启后串口顺序变了就慌
- 不会修 \`Permission denied\` → 80% 的人第一次连机械臂就卡在这

这一章是纯硬件认知，**没有机械臂也能读懂**，等硬件到手能直接上手。`,

    keyTerms: ['Leader / Follower', '遥操作', 'SO101 / SO-ARM100', '校准'],

    diagrams: [
      {
        title: 'Leader → 电脑 → Follower 的数据链路',
        source: `flowchart LR
    H["👋 你的手"] -->|"扳动关节"| L["🦾 Leader 主臂"]
    L -->|"USB 读关节角"| PC["💻 电脑"]
    PC -->|"USB 发指令"| F["🦾 Follower 从臂"]
    PC -->|"同步录入"| D["📦 数据集 (s, a)"]
    style L fill:#7c5cff,stroke:#7c5cff,color:#fff
    style F fill:#0ea5e9,stroke:#0ea5e9,color:#fff
    style PC fill:#22c55e,stroke:#22c55e,color:#fff`,
        caption: '你扳 Leader → 电脑读它的关节角 → 同时让 Follower 复现 + 把角度写进数据集。30 fps 不停转。'
      }
    ],

    walkthrough: [
      {
        title: '认识 6 个自由度',
        body: `SO101 一条臂有 **6 个关节**，每个关节一个电机，可独立转动：底座旋转、肩、肘、腕部两个自由度、爪子开合。

6 个自由度是工业机械臂的标配 —— 足以让末端（爪子）到达三维空间的**任意位置**（x/y/z）加**任意姿态**（俯仰/偏航/翻滚）。

这也解释了为什么第 1 章说状态 s 是 6 维：一个关节贡献一维角度读数。`,
        tip: '两条臂硬件完全相同，所以合起来的状态/动作维度是 6 + 6 = 12 维。'
      },
      {
        title: '把两条臂接上电脑，认出串口',
        body: `机械臂通过 USB 转串口连接电脑。在 Linux / macOS 上，每条臂会变成一个设备文件，名字形如 \`/dev/ttyUSB0\`。

最稳的分辨方法是「拔一根看哪个消失」：先看一次列表，拔掉 Leader 的 USB，再看一次，少掉的那个就是 Leader。`,
        command: {
          description: '列出所有串口设备',
          code: 'ls /dev/tty*'
        },
        expectedOutput: '/dev/tty   /dev/ttyS0   /dev/ttyUSB0   /dev/ttyUSB1',
        tip: '`ttyUSB0` / `ttyUSB1` 就是你的两条机械臂；`ttyS0`、`tty` 是系统自带的，忽略。'
      },
      {
        title: '理解"角色由配置决定，不是出厂决定"',
        body: `两条臂出厂时完全一样，没有贴"我是 Leader"的标签。**哪条是 Leader、哪条是 Follower，是你在配置文件里写哪个端口对应哪个角色决定的**（第 4 章会做）。

所以你只要记住：插上之后认出哪个 ttyUSB 是哪条臂，剩下的在软件里指定即可。`,
        warning: '重启电脑或重新插拔后，ttyUSB0 / ttyUSB1 的编号可能对调 —— 这是 Linux 串口的老问题。每次开机最好用"拔一根"法快速确认一下，或用 udev 规则固定（高级话题）。'
      }
    ],

    pitfalls: [
      {
        symptom: '「两条臂长得一样，我是不是买错了/多发了一条？」',
        cause: '不知道 SO101 本来就是双臂主从设计。',
        fix: '没买错。两条是配套协同的：Leader 给人操作，Follower 复现。这正是采集演示数据的方式。'
      },
      {
        symptom: '一连机械臂就报 `Permission denied: /dev/ttyUSB0`。',
        cause: '你的账号不在能访问串口的用户组（Ubuntu 的 dialout / Arch 的 uucp）里。',
        fix: '`sudo usermod -a -G dialout $USER`，然后**注销重新登录**（或重启）。这是几乎人人都会撞一次的坑。'
      },
      {
        symptom: '`ls /dev/tty*` 根本看不到 ttyUSB。',
        cause: 'USB 线是充电线没有数据、或缺 CH340 串口驱动。',
        fix: '换一条**带数据**的 USB 线；`dmesg | tail` 看插入时有没有识别信息；必要时装 CH340 驱动。'
      }
    ],

    exercises: [
      {
        title: '分辨 Leader 和 Follower',
        instructions: `两条 USB 都插上后：

1. 跑 \`ls /dev/tty*\` 记下出现了哪几个 ttyUSB
2. 拔掉其中一条（你打算当 Leader 的那条）的 USB
3. 再跑一次 \`ls /dev/tty*\`

哪个 ttyUSB 消失了，说明它是哪条臂？`,
        hint: '消失的那个 = 你刚拔的那条。',
        expectedResult: '消失的 ttyUSB 编号就对应你拔掉的那条臂。把它记下来 —— 第 4 章配置 yaml 时，leader_arms 的 port 就填这个。'
      },
      {
        title: '算一算数据维度',
        instructions: '两条 SO101 臂协同工作，每条 6 个关节。一帧"状态 + 动作"合起来总共多少维？',
        hint: '(状态维度 + 动作维度)，注意只有 Leader 产生 action，Follower/状态都是 6 维。',
        expectedResult: '常见配置下：observation.state = 6 维（Follower 当前角度），action = 6 维（目标角度），合计 **12 维**。如果两条臂都记录状态则更多 —— 看具体任务配置。'
      }
    ],

    selfCheck: [
      {
        question: '怎么判断面前两条一模一样的臂哪条是 Leader？',
        answer: '硬件上分辨不了 —— 它们出厂相同。靠**软件配置**：你把哪条接到哪个 USB、并在 yaml 里把那个端口写成 leader，它就是 Leader。物理上可用"拔一根看哪个 ttyUSB 消失"来认端口。'
      },
      {
        question: '`Permission denied: /dev/ttyUSB0` 是硬件坏了吗？',
        answer: '不是。是权限问题 —— 你的账号没在 dialout 组。`sudo usermod -a -G dialout $USER` 后重新登录即可，机械臂本身没问题。'
      },
      {
        question: '为什么状态向量是 6 维？',
        answer: '因为一条 SO101 臂有 6 个关节，每个关节一个角度读数，6 个关节 = 6 维。6 自由度足以让末端到达三维空间任意位置 + 任意姿态。'
      }
    ],

    furtherReading: [
      {
        title: 'SO-ARM100 硬件项目（GitHub）',
        url: 'https://github.com/TheRobotStudio/SO-ARM100',
        note: 'BOM、3D 打印件、装配指南。想自己拼一台或了解机械结构看这里。'
      },
      {
        title: 'Linux 串口权限与 dialout 组说明',
        url: 'https://wiki.archlinux.org/title/Working_with_the_serial_console',
        note: '理解 ttyUSB 权限模型，遇到串口报错时有用。'
      }
    ],

    summary: `**SO101 是两条一样的臂**：Leader 你手动操作，Follower 实时复现，电脑同步记录 Leader 的关节角作为演示数据。

角色不是出厂定的，是你**接线 + 配置**决定的。机械臂在系统里是 \`/dev/ttyUSB*\` 文件；第一次连大概率撞 \`Permission denied\`，加进 dialout 组 + 重新登录即可。

下一章我们装软件环境（不需要硬件），把 LeRobot 跑起来。`
  },
  {
    id: 3,
    title: 'LeRobot 环境安装',
    titleEn: 'LeRobot Environment Setup',
    description: '安装配置 LeRobot 框架，包括 Python 环境、依赖包和 CUDA 配置',
    duration: '30 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '创建并激活 Python 虚拟环境',
      '安装 LeRobot 及其依赖',
      '配置 CUDA 和 PyTorch'
    ],
    principles: [
      'LeRobot 是 Hugging Face 开发的机器人学习框架',
      '支持多种机械臂和模仿学习算法',
      '需要 Python 3.10+ 和 CUDA 支持'
    ],
    steps: [
      { title: '创建环境', content: '使用 conda 或 venv 创建独立的 Python 环境' },
      { title: '克隆仓库', content: '从 GitHub 克隆 LeRobot 代码' },
      { title: '安装依赖', content: '使用 pip 安装所有必要的依赖包' },
      { title: '验证安装', content: '运行测试脚本确认安装成功' }
    ],
    commands: [
      { description: '创建 conda 环境', code: 'conda create -n lerobot python=3.10 -y' },
      { description: '激活环境', code: 'conda activate lerobot' },
      { description: '克隆 LeRobot', code: 'git clone https://github.com/huggingface/lerobot.git' },
      { description: '安装依赖', code: 'cd lerobot && pip install -e .' },
      { description: '验证 PyTorch', code: 'python -c "import torch; print(torch.cuda.is_available())"' }
    ],
    checkpoints: [
      'conda 环境创建成功',
      'LeRobot 安装无报错',
      'PyTorch 能够检测到 CUDA'
    ],
    errors: [
      {
        error: 'CUDA out of memory',
        cause: 'GPU 显存不足',
        solution: '减小 batch_size 或使用梯度累积',
        command: 'export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512'
      },
      {
        error: 'ModuleNotFoundError: No module named lerobot',
        cause: 'LeRobot 未正确安装或环境未激活',
        solution: '确认已激活正确的 conda 环境并重新安装',
        command: 'conda activate lerobot && pip install -e .'
      }
    ],

    introduction: `这一章**完全不需要机械臂** —— 但它劝退了大约 80% 的初学者。原因几乎都不是 LeRobot 本身难装，而是**环境没隔离干净**：有人直接拿系统 Python 一把梭 \`pip install\`，几天后系统启动器都被搞坏。

我们用 **conda** 建一个完全独立的环境。它不只隔离 Python 包，还隔离 **Python 版本本身** —— 你的系统装什么版本都不管，conda 单独给 LeRobot 一个干净的 3.10。崩了？删掉环境重建，系统毫发无伤。

这一章把"建环境 → 装 LeRobot → 验证 PyTorch/CUDA"一步步走通，并提前认识那个你迟早会遇到的 \`CUDA out of memory\`。`,

    whyItMatters: `环境是地基，地基歪了后面全塌：

- 用系统 Python 装依赖 → 迟早污染系统，难以收拾
- 不验证 PyTorch/CUDA → 训练时才发现 GPU 没接上，白等几小时
- 不懂 OOM 应急 → 一遇到显存报错就以为是显卡不够，其实改个参数就行

把这一章走干净，后面的数据采集、训练、推理都建立在一个可复现、可删除重建的环境上。`,

    keyTerms: ['LeRobot', 'CUDA / AMP', 'HuggingFace Hub'],

    diagrams: [
      {
        title: '为什么用 conda 隔离',
        source: `flowchart TB
    OS["💻 操作系统"] --> Sys["🐍 系统 Python (别碰)"]
    OS --> Conda["📦 conda 管理器"]
    Conda --> E1["🟢 env: lerobot (Python 3.10)"]
    Conda --> E2["🟡 env: 其他项目"]
    style Sys fill:#7f1d1d,stroke:#7f1d1d,color:#fff
    style E1 fill:#15803d,stroke:#15803d,color:#fff`,
        caption: '系统 Python（红）留给操作系统。conda 给每个项目独立环境（绿），想装啥装啥，崩了删了重建。'
      }
    ],

    walkthrough: [
      {
        title: '创建 LeRobot 专属环境',
        body: `用 conda 建一个名为 \`lerobot\`、Python 版本锁定 3.10 的独立环境。\`-y\` 表示"别问了直接装"。

如果你还没装 conda，先去装 **Miniconda**（不要 Anaconda，太重）。`,
        command: {
          description: '创建并准备环境',
          code: 'conda create -n lerobot python=3.10 -y'
        },
        expectedOutput: '...\nPreparing transaction: done\nVerifying transaction: done\nExecuting transaction: done\n#\n# To activate this environment, use\n#     $ conda activate lerobot',
        tip: '看到 "To activate ... conda activate lerobot" 就成功了。'
      },
      {
        title: '激活环境并安装 LeRobot',
        body: `先激活环境（命令行提示符会多出 \`(lerobot)\` 前缀），再从 GitHub 克隆并以可编辑模式安装。

**每开一个新终端都要先 \`conda activate lerobot\`** —— 忘了激活是 ModuleNotFoundError 的头号原因。`,
        command: {
          description: '激活 + 克隆 + 安装',
          code: 'conda activate lerobot\ngit clone https://github.com/huggingface/lerobot.git\ncd lerobot && pip install -e .'
        },
        expectedOutput: '(lerobot) $\n... (下载编译约 3-5 分钟) ...\nSuccessfully installed lerobot torch numpy ...',
        warning: '提示符没有 `(lerobot)` 前缀就说明环境没激活，这时 pip 装的东西全进了错误的地方。'
      },
      {
        title: '验证 PyTorch 能用 + 能否看到 GPU',
        body: `装完不等于能用。跑一行代码同时验证两件事：PyTorch 装好了、以及 GPU 能否被检测到。

输出 \`True\` = GPU 可用；输出 \`False\` = PyTorch 装对了但没找到 GPU（你没显卡，或驱动没装）。`,
        command: {
          description: '验证脚本',
          code: 'python -c "import torch; print(torch.cuda.is_available())"'
        },
        expectedOutput: 'True',
        tip: '输出 False 也别慌 —— 见下方"常见误区"，没 GPU 一样能学前 6 章。'
      }
    ],

    pitfalls: [
      {
        symptom: '验证输出了 `False`，是不是装错了要重装？',
        cause: '`False` 只代表"没找到可用 GPU"，不代表 PyTorch 装错。',
        fix: '没 GPU 也能跑，LeRobot 自动 fallback 到 CPU，只是训练慢 10-30 倍。前 6 章（采集、数据、推理体验）CPU 完全够，第 7 章训练才想要 GPU。删了重装也是同样结果，别折腾。'
      },
      {
        symptom: '`ModuleNotFoundError: No module named lerobot`',
        cause: '当前终端没激活 lerobot 环境，或安装没成功。',
        fix: '先 `conda activate lerobot` 确认提示符有 `(lerobot)`，再 `pip install -e .`。`pip list` 可检查是否装上。'
      },
      {
        symptom: '直接用系统 Python `pip install` 了，现在系统有点怪。',
        cause: '污染了系统 Python 环境。',
        fix: '以后所有项目都用 conda/venv 隔离，永远别动系统 Python。已经污染的话，conda 新环境是干净起点，系统层面的问题按发行版文档修复。'
      }
    ],

    exercises: [
      {
        title: '确认你在正确的环境里',
        instructions: '打开一个新终端，先不要激活任何环境，直接跑 `python -c "import lerobot"`。会发生什么？然后 `conda activate lerobot` 再跑一次。对比两次结果。',
        hint: '没激活时 import 会失败，激活后成功。',
        expectedResult: '没激活 → `ModuleNotFoundError`（因为系统 Python 没装 lerobot）。激活后 → 无报错。这就是"每个新终端都要先 activate"的直接证据。'
      },
      {
        title: '预演 OOM 应急',
        instructions: '假设第 7 章训练时报 `CUDA out of memory`。不查文档，凭这一章的内容，你第一个该调的参数是什么？',
        hint: '显存不够 ≈ 一次塞进 GPU 的样本太多。',
        expectedResult: '把 `batch_size` 改小（如 `training.batch_size=4`）。还不行再开梯度累积 + 混合精度。90% 的 OOM 第一步就解决。'
      }
    ],

    selfCheck: [
      {
        question: '为什么不直接用系统自带的 Python？',
        answer: '系统 Python 是给操作系统自己用的，乱装包会污染它，可能搞坏系统工具。conda 建独立环境，隔离包 + Python 版本，崩了删掉重建不影响系统。'
      },
      {
        question: '`torch.cuda.is_available()` 返回 False 还能继续学吗？',
        answer: '能。LeRobot 自动用 CPU，只是慢。前 6 章不需要 GPU，第 7 章训练 ACT 才明显受益于 GPU。'
      },
      {
        question: '`CUDA out of memory` 最先该试什么？',
        answer: '调小 `batch_size`。这是 90% OOM 的根因 —— 一次计算的样本太多塞不下显存。'
      }
    ],

    furtherReading: [
      {
        title: 'Miniconda 安装文档',
        url: 'https://docs.conda.io/en/latest/miniconda.html',
        note: '装 conda 的官方入口，选 Miniconda 不要 Anaconda。'
      },
      {
        title: 'LeRobot 官方仓库 README',
        url: 'https://github.com/huggingface/lerobot',
        note: '最权威的安装说明，本章和它保持一致。'
      },
      {
        title: 'PyTorch Mixed Precision (AMP) 指南',
        url: 'https://pytorch.org/docs/stable/amp.html',
        note: '显存吃紧时的官方解法，第 7 章会用到。'
      }
    ],

    summary: `**用 conda 建独立环境**，别碰系统 Python。\`conda create -n lerobot python=3.10\` → \`conda activate lerobot\` → 克隆 + \`pip install -e .\` → \`torch.cuda.is_available()\` 验证。

记住两条铁律：每个新终端先 \`activate\`；\`CUDA out of memory\` 先调小 \`batch_size\`。

下一章让电脑真正认出机械臂的两条串口，并做关键的校准。`
  },
  {
    id: 4,
    title: '端口识别与机械臂校准',
    titleEn: 'Port Detection & Calibration',
    description: '识别机械臂端口，完成电机校准，确保运动精度',
    duration: '25 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '正确识别 Leader 和 Follower 端口',
      '完成机械臂零点校准',
      '验证校准结果的准确性'
    ],
    principles: [
      '校准确保电机角度与实际位置一致',
      '校准数据保存在配置文件中',
      '每次更换电机或重新组装后需要重新校准'
    ],
    steps: [
      { title: '端口配置', content: '在配置文件中指定 Leader 和 Follower 的串口路径' },
      { title: '零点设置', content: '将机械臂移动到初始位置并记录' },
      { title: '校准验证', content: '测试各关节运动范围是否正确' }
    ],
    commands: [
      { description: '运行校准脚本', code: 'python lerobot/scripts/control_robot.py calibrate --robot-path lerobot/configs/robot/so100.yaml' },
      { description: '查看校准结果', code: 'cat ~/.cache/huggingface/lerobot/calibration/so100.json' }
    ],
    checkpoints: [
      '端口正确识别',
      '校准数据保存成功',
      '关节运动范围正确'
    ],
    errors: [
      {
        error: 'Missing required field(s) port',
        cause: '配置文件中未指定端口',
        solution: '在 robot 配置中添加 port 字段',
        command: 'vim lerobot/configs/robot/so100.yaml'
      }
    ],

    introduction: `两条 USB 都接上了，\`ls /dev/tty*\` 也能看到 ttyUSB0 和 ttyUSB1。但你还差两步才能开始采数据：

1. **告诉 LeRobot 哪个端口是 Leader、哪个是 Follower** —— 写进配置文件
2. **校准** —— 让电脑知道每个电机的"真零点"

校准是这一章的重点，也是最容易被忽略、忽略了又必然出问题的一步。机械臂出厂时每个电机的零点都有装配公差：你说"去 30 度"，它实际可能去了 31 度或 28 度。不校准的话，Follower 跟随会偏、录的数据会失真、训练出来的模型必崩。

这一步**跳不过去**，但好在脚本会一步步引导，3 分钟搞定。`,

    whyItMatters: `校准是数据质量的第一道闸门：

- 没校准 → Leader 读 30 度但 Follower 实际 33 度 → 你以为录的是 A 动作，存进数据集的是 B → 模型学到的是错的
- 端口配错 → 脚本直接报 \`Missing required field(s) port\` 或连不上
- 校准是"垃圾进垃圾出"里最前端的环节：**这里偏一点，后面训练再用力也白搭**`,

    keyTerms: ['校准', 'Leader / Follower', '串口'],

    diagrams: [
      {
        title: '校准前 vs 校准后',
        source: `flowchart LR
    subgraph Before ["未校准"]
        B1["Leader 读 30度"] -.->|"偏差 3度"| B2["Follower 实际 33度"]
    end
    subgraph After ["校准后"]
        A1["Leader 读 30度"] -->|"一致"| A2["Follower 实际 30度"]
    end
    style Before fill:#fef2f2,stroke:#dc2626
    style After fill:#f0fdf4,stroke:#16a34a`,
        caption: '校准让 Leader 读数与 Follower 实际姿态对齐。未校准时 1-5 度的偏差会污染整份数据集。'
      }
    ],

    walkthrough: [
      {
        title: '认出哪个端口是哪条臂',
        body: `最稳的土办法：\`ls /dev/tty*\` 看一次 → 拔掉 Leader 的 USB → 再看一次，少掉的那个就是 Leader。

LeRobot 也自带探测工具 \`find_motors_bus_port.py\`，会逐个端口询问"你是几号电机"来告诉你对应关系，不用拔线。`,
        command: {
          description: '查看串口（拔线前后各一次对比）',
          code: 'ls /dev/tty*'
        },
        expectedOutput: '第一次:  ttyUSB0  ttyUSB1\n第二次:  ttyUSB0            ← 少了 ttyUSB1，它就是刚拔的 Leader'
      },
      {
        title: '把端口写进配置文件',
        body: `知道哪个 ttyUSB 是哪个角色后，编辑 \`lerobot/configs/robot/so100.yaml\`，把端口填进 leader_arms / follower_arms。

\`main\` 只是个名字，可以叫任何东西；\`port\` 填上一步认出的实际设备路径。改完保存，之后所有命令都会读这份配置。`,
        command: {
          description: 'so100.yaml 里的端口配置',
          code: 'leader_arms:\n  main:\n    port: /dev/ttyUSB1\nfollower_arms:\n  main:\n    port: /dev/ttyUSB0'
        },
        warning: '重启后 ttyUSB 编号可能对调，届时要回来改这里 —— 这是 `Missing required field(s) port` 之外最常见的"昨天还好好的今天连不上"。'
      },
      {
        title: '运行校准',
        body: `跑校准脚本，它会一步步引导你把机械臂**手动摆到指定姿态**（如完全伸展、回零位），每摆一个按一次 Enter。整个过程 1-2 分钟，数据自动保存到 \`~/.cache/.../calibration.json\`。`,
        command: {
          description: '启动校准',
          code: 'python lerobot/scripts/control_robot.py calibrate \\\n  --robot-path lerobot/configs/robot/so100.yaml'
        },
        expectedOutput: 'Calibrating leader_arms/main...\n[INFO] Move arm to fully-extended pose, press Enter...\n[INFO] Move arm to home pose, press Enter...\n[INFO] Saving calibration ... Done!',
        warning: '手动摆姿态时**轻柔扳动**。SO101 电机不带阻尼，硬扳可能损坏齿轮。'
      }
    ],

    pitfalls: [
      {
        symptom: '校准做完了，但 Follower 跟随还是偏。',
        cause: '摆姿态时不够准 —— "完全伸展"其实只伸了 80%，导致参考点偏。',
        fix: '重跑校准，严格按提示/图示摆到位，可拿尺子比对。校准数据会覆盖旧的，重做安全。'
      },
      {
        symptom: '`Missing required field(s) port`',
        cause: 'yaml 里没写 port，或缩进错了导致没被解析。',
        fix: '在 leader_arms / follower_arms 下补上正确缩进的 `port:` 字段。YAML 对缩进敏感，用空格不要用 Tab。'
      },
      {
        symptom: '「校准一次就一劳永逸了吧？」',
        cause: '以为校准是终身有效的。',
        fix: '校准数据存硬盘，关机不丢；但**换电机、拆装、运输颠簸**后零点会变，需重新校准。平时不用反复做。'
      }
    ],

    exercises: [
      {
        title: '判断要不要重新校准',
        instructions: `下面哪些情况需要重新校准？\n\nA. 关机一晚，第二天开机\nB. 机械臂从桌上摔了一下\nC. 换了一个电机\nD. 只是重新插了下 USB`,
        hint: '校准数据存在硬盘，丢的是"物理零点"，不是文件。',
        expectedResult: '需要重校：**B（摔了）、C（换电机）**。不需要：A（数据在硬盘，没丢）、D（插拔 USB 不影响电机零点，但可能改变 ttyUSB 编号，要去 yaml 确认端口）。'
      }
    ],

    selfCheck: [
      {
        question: '不校准直接采数据会怎样？',
        answer: 'Leader 的读数和 Follower 的实际姿态对不上，录进数据集的 (s, a) 是错位的。用这种数据训练，模型学到的映射本身就是歪的，再怎么训也跑不准。'
      },
      {
        question: '一条臂要校准几个电机？',
        answer: '6 个（每个关节一个）。脚本会自动逐个走完，不用手动选。两条臂就是 12 个。'
      },
      {
        question: '机械臂角色（Leader/Follower）是怎么确定的？',
        answer: '由配置文件里 leader_arms / follower_arms 各自填的 port 决定，不是硬件出厂决定。'
      }
    ],

    furtherReading: [
      {
        title: 'LeRobot 机器人控制脚本文档',
        url: 'https://github.com/huggingface/lerobot',
        note: 'control_robot.py 的 calibrate / teleoperate / record 子命令说明。'
      }
    ],

    summary: `两步走：**认端口**（拔线法或 find_motors）→ 写进 so100.yaml 的 leader_arms / follower_arms；**校准**（跑 calibrate 脚本，手动摆姿态记零点）。

校准对齐了 Leader 读数与 Follower 实际姿态，是数据质量的第一道闸门，硬件没变动就不用重做。

下一章是最爽的部分：真的拿起机械臂演示动作，把数据录下来。`
  },
  {
    id: 5,
    title: '遥操作与数据采集',
    titleEn: 'Teleoperation & Data Collection',
    description: '使用 Leader 臂遥操作 Follower 臂，采集训练数据集',
    duration: '40 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '掌握遥操作的基本流程',
      '了解数据采集的参数设置',
      '完成一个完整的数据采集任务'
    ],
    principles: [
      '遥操作通过读取 Leader 关节位置控制 Follower',
      '数据包括关节角度、图像和时间戳',
      '数据质量直接影响模型训练效果'
    ],
    steps: [
      { title: '启动遥操作', content: '运行遥操作脚本，建立 Leader-Follower 连接' },
      { title: '任务演示', content: '操作 Leader 臂完成目标任务多次' },
      { title: '数据保存', content: '确认数据正确保存到指定目录' }
    ],
    commands: [
      { description: '启动遥操作', code: 'python lerobot/scripts/control_robot.py teleoperate --robot-path lerobot/configs/robot/so100.yaml' },
      { description: '录制数据集', code: 'python lerobot/scripts/control_robot.py record --robot-path lerobot/configs/robot/so100.yaml --repo-id your-name/so100-task --num-episodes 50' }
    ],
    checkpoints: [
      'Leader-Follower 同步正常',
      '数据文件正确生成',
      '图像帧率稳定'
    ],
    errors: []
  },
  {
    id: 6,
    title: '数据集结构与 meta/info.json',
    titleEn: 'Dataset Structure & Metadata',
    description: '理解 LeRobot 数据集格式、目录结构和元数据文件',
    duration: '20 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '理解 LeRobot 数据集目录结构',
      '掌握 meta/info.json 的作用',
      '学会检查和修复数据集问题'
    ],
    principles: [
      '数据集包含 parquet 文件和视频数据',
      'meta/info.json 记录数据集的元信息',
      '正确的数据格式是训练成功的前提'
    ],
    steps: [
      { title: '目录结构', content: '了解 data/、meta/、videos/ 等目录的作用' },
      { title: '元数据检查', content: '查看 info.json 确认数据集信息正确' },
      { title: '数据验证', content: '使用工具验证数据集完整性' }
    ],
    commands: [
      { description: '查看数据集结构', code: 'tree ~/.cache/huggingface/lerobot/your-name/so100-task' },
      { description: '查看元数据', code: 'cat ~/.cache/huggingface/lerobot/your-name/so100-task/meta/info.json' },
      { description: '验证数据集', code: 'python -c "from lerobot.common.datasets.lerobot_dataset import LeRobotDataset; ds = LeRobotDataset(\'your-name/so100-task\')"' }
    ],
    checkpoints: [
      '理解目录结构',
      'info.json 内容正确',
      '数据集加载无报错'
    ],
    errors: [
      {
        error: 'FileNotFoundError: meta/info.json',
        cause: '数据集元数据文件缺失',
        solution: '检查数据集目录是否完整，可能需要重新采集',
        command: 'ls -la ~/.cache/huggingface/lerobot/your-name/so100-task/meta/'
      }
    ]
  },
  {
    id: 7,
    title: 'ACT 模型训练',
    titleEn: 'ACT Model Training',
    description: '配置并训练 ACT（Action Chunking Transformer）模型',
    duration: '45 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '理解 ACT 模型的架构和优势',
      '配置训练超参数',
      '完成模型训练并监控进度'
    ],
    principles: [
      'ACT 使用 Transformer 预测动作序列',
      'Action Chunking 提高时序一致性',
      'CVAE 结构增强策略的多样性'
    ],
    steps: [
      { title: '配置检查', content: '确认训练配置文件参数正确' },
      { title: '启动训练', content: '运行训练脚本并监控 loss 变化' },
      { title: '模型保存', content: '保存最佳检查点用于部署' }
    ],
    commands: [
      { description: '启动 ACT 训练', code: 'python lerobot/scripts/train.py policy=act env=so100 dataset_repo_id=your-name/so100-task' },
      { description: '使用 wandb 监控', code: 'wandb login && python lerobot/scripts/train.py policy=act env=so100 wandb.enable=true' },
      { description: '恢复训练', code: 'python lerobot/scripts/train.py policy=act resume=true' }
    ],
    checkpoints: [
      '训练启动无报错',
      'Loss 持续下降',
      '检查点正常保存'
    ],
    errors: [
      {
        error: 'CUDA out of memory',
        cause: 'GPU 显存不足以运行当前 batch_size',
        solution: '减小 batch_size 或启用梯度累积',
        command: 'python lerobot/scripts/train.py policy=act training.batch_size=8'
      }
    ]
  },
  {
    id: 8,
    title: '模型推理与真实机械臂部署',
    titleEn: 'Inference & Deployment',
    description: '加载训练好的模型，在真实机械臂上进行推理和部署',
    duration: '35 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '加载训练好的模型检查点',
      '配置推理参数',
      '在真实机械臂上运行策略'
    ],
    principles: [
      '推理时需要保持与训练一致的观测空间',
      '实时控制需要考虑延迟和稳定性',
      '安全措施防止机械臂意外动作'
    ],
    steps: [
      { title: '模型加载', content: '指定检查点路径加载训练好的模型' },
      { title: '推理测试', content: '在仿真或简单任务上测试模型' },
      { title: '实机部署', content: '连接真实机械臂运行策略' }
    ],
    commands: [
      { description: '运行推理', code: 'python lerobot/scripts/control_robot.py record --robot-path lerobot/configs/robot/so100.yaml --policy-path outputs/train/act_so100/checkpoints/last/pretrained_model' },
      { description: '可视化推理', code: 'python lerobot/scripts/visualize_dataset.py --repo-id your-name/so100-task' }
    ],
    checkpoints: [
      '模型加载成功',
      '推理帧率稳定',
      '机械臂动作平滑'
    ],
    errors: [
      {
        error: '机械臂推理时抖动',
        cause: '控制频率不稳定或模型输出噪声大',
        solution: '检查 fps 设置，考虑添加平滑滤波'
      }
    ]
  },
  {
    id: 9,
    title: '常见报错与调试方法',
    titleEn: 'Troubleshooting & Debugging',
    description: '汇总常见问题的诊断和解决方法',
    duration: '20 分钟',
    status: 'locked',
    progress: 0,
    objectives: [
      '掌握常见错误的诊断方法',
      '学会查看日志定位问题',
      '积累调试经验'
    ],
    principles: [
      '错误信息是最好的调试起点',
      '系统化排查优于随机尝试',
      '记录问题和解决方案便于复用'
    ],
    steps: [
      { title: '错误分类', content: '区分环境、硬件、数据、训练等不同类型的错误' },
      { title: '日志分析', content: '学会从日志中提取关键错误信息' },
      { title: '解决验证', content: '应用解决方案并验证问题是否解决' }
    ],
    commands: [
      { description: '查看完整错误栈', code: 'python script.py 2>&1 | tee error.log' },
      { description: '检查 GPU 状态', code: 'nvidia-smi' },
      { description: '检查磁盘空间', code: 'df -h' }
    ],
    checkpoints: [
      '能够独立诊断常见错误',
      '建立个人错误知识库',
      '理解调试的系统方法'
    ],
    errors: []
  }
]

export const errorDatabase: Record<string, DiagnosticResult> = {
  'missing required field(s) port': {
    error: 'Missing required field(s) port',
    cause: '机器人配置文件中未指定 port 字段，LeRobot 无法确定与机械臂通信的串口',
    solution: '在 robot 配置文件（如 so100.yaml）中添加 port 字段，指定正确的串口路径',
    command: 'leader_arms:\n  main:\n    port: /dev/ttyUSB0\nfollower_arms:\n  main:\n    port: /dev/ttyUSB1',
    nextStep: '运行 ls /dev/tty* 确认串口设备存在，然后更新配置文件',
    category: 'hardware',
    related: ['permission denied', 'serial port not found']
  },
  'filenotfounderror meta/info.json': {
    error: 'FileNotFoundError: meta/info.json',
    cause: '数据集目录结构不完整，缺少必要的元数据文件。可能是数据采集中断或目录路径错误',
    solution: '检查数据集目录是否存在，确认 meta 文件夹及其内容完整。如果确实缺失，需要重新采集数据',
    command: 'ls -la ~/.cache/huggingface/lerobot/your-repo-id/meta/',
    nextStep: '如果目录为空或不存在，请重新运行数据采集脚本',
    category: 'data',
    related: ['dataset not found', 'parquet read error']
  },
  'cuda out of memory': {
    error: 'CUDA out of memory',
    cause: 'GPU 显存不足，无法分配训练所需的内存。通常是 batch_size 过大或模型太大',
    solution: '减小 batch_size，启用梯度累积，或使用混合精度训练 (amp)',
    command: 'python lerobot/scripts/train.py policy=act training.batch_size=4 training.grad_accumulation_steps=4',
    nextStep: '使用 nvidia-smi 监控显存使用，逐步调整参数找到最佳配置',
    category: 'training',
    related: ['training too slow', 'nan loss']
  },
  'permission denied': {
    error: 'Permission denied: /dev/ttyUSB*',
    cause: '当前用户没有访问串口设备的权限',
    solution: '将用户添加到 dialout 组并重新登录',
    command: 'sudo usermod -a -G dialout $USER',
    nextStep: '注销并重新登录使权限生效，或使用 newgrp dialout 临时切换组',
    category: 'hardware',
    related: ['missing required field(s) port']
  },
  'modulenotfounderror': {
    error: 'ModuleNotFoundError: No module named ...',
    cause: '缺少必要的 Python 包，或虚拟环境未正确激活',
    solution: '确认已激活正确的 conda/venv 环境，然后安装缺失的包',
    command: 'conda activate lerobot && pip install -e .',
    nextStep: '运行 pip list 检查已安装的包',
    category: 'environment',
    related: ['importerror', 'pip install fail']
  },
  '机械臂抖动': {
    error: '机械臂推理时抖动',
    cause: '控制频率不稳定、网络延迟或模型输出噪声过大',
    solution: '1. 检查并固定 fps 设置\n2. 添加动作平滑滤波 (EMA)\n3. 确保 USB 连接稳定',
    command: 'python lerobot/scripts/control_robot.py record --fps 30 --policy-path ...',
    nextStep: '尝试降低控制频率或添加 EMA 平滑',
    category: 'inference',
    related: ['inference latency high']
  },
  'nan loss': {
    error: 'Training loss becomes NaN',
    cause: '学习率过高、数据存在异常值或归一化出错，导致梯度爆炸',
    solution: '1. 降低学习率\n2. 启用梯度裁剪\n3. 检查数据集是否有 NaN 或极端值',
    command: 'python lerobot/scripts/train.py policy=act training.lr=1e-5 training.grad_clip_norm=10',
    nextStep: '使用 wandb / tensorboard 监控梯度范数，定位异常 batch',
    category: 'training',
    related: ['cuda out of memory']
  },
  'training too slow': {
    error: '训练速度过慢',
    cause: '数据加载瓶颈、batch_size 过小、未使用混合精度，或 GPU 利用率低',
    solution: '1. 增大 num_workers\n2. 启用 AMP 混合精度\n3. 适当提高 batch_size\n4. 检查 GPU 利用率',
    command: 'python lerobot/scripts/train.py policy=act training.num_workers=8 training.amp=true',
    nextStep: '运行 nvidia-smi dmon 监控 GPU 利用率与功耗',
    category: 'training'
  },
  'serial port not found': {
    error: '/dev/ttyUSB0 不存在',
    cause: '机械臂未连接、USB 线缆故障或驱动未加载',
    solution: '1. 物理检查 USB 线缆\n2. 使用 dmesg | tail 查看接入信息\n3. 重新拔插 USB',
    command: 'dmesg | tail -n 20',
    nextStep: '若仍无 ttyUSB，尝试更换 USB 线缆或安装 CH340 驱动',
    category: 'hardware'
  },
  'leader follower mismatch': {
    error: 'Leader 与 Follower 关节角偏差大',
    cause: '机械臂未校准或电机零点不一致',
    solution: '重新运行校准脚本，确保两条臂在相同姿态下记录零点',
    command: 'python lerobot/scripts/control_robot.py calibrate --robot-path lerobot/configs/robot/so100.yaml',
    nextStep: '校准完成后再次运行遥操作，观察跟随性',
    category: 'hardware'
  },
  'inference latency high': {
    error: '推理 fps 不稳定 / 延迟高',
    cause: 'CPU 与 GPU 之间数据传输瓶颈，或图像编码阻塞',
    solution: '1. 降低相机分辨率\n2. 使用半精度推理\n3. 关闭无关后台进程',
    command: 'python lerobot/scripts/control_robot.py record --fps 30 --device cuda',
    nextStep: '使用 time.perf_counter() 在推理循环中打点，定位耗时段',
    category: 'inference'
  },
  'wandb login fail': {
    error: 'wandb: ERROR Authentication required',
    cause: '未登录 wandb 或 API key 失效',
    solution: '登录 wandb 并刷新 token',
    command: 'wandb login',
    nextStep: '将 API key 写入 ~/.netrc 以便 CI 自动登录',
    category: 'environment'
  },
  'video codec error': {
    error: 'OpenCV 无法解码视频文件',
    cause: '缺少 ffmpeg / 解码器，或视频格式不被支持',
    solution: '安装系统级 ffmpeg 并重装 opencv',
    command: 'sudo apt install -y ffmpeg && pip install opencv-python-headless --force-reinstall',
    nextStep: '使用 ffprobe 检查视频元信息',
    category: 'data'
  }
}

export const aiResponses: Record<string, string> = {
  'so101 如何校准': `SO101 机械臂校准步骤：

1. **准备工作**
   - 确保机械臂已正确连接到电脑
   - 激活 LeRobot 环境

2. **运行校准脚本**
\`\`\`bash
python lerobot/scripts/control_robot.py calibrate \\
  --robot-path lerobot/configs/robot/so100.yaml
\`\`\`

3. **校准过程**
   - 按提示将机械臂移动到指定位置
   - 依次校准每个关节的零点
   - 校准数据会自动保存

4. **验证校准**
   - 运行遥操作测试运动范围
   - 确认关节角度显示正确`,

  'act 和 bc 有什么区别': `**ACT vs BC 对比：**

| 特性 | BC (Behavior Cloning) | ACT (Action Chunking Transformer) |
|------|----------------------|-----------------------------------|
| 输出 | 单步动作 | 动作序列 (chunk) |
| 架构 | 简单 MLP/CNN | Transformer + CVAE |
| 时序建模 | 弱 | 强 |
| 多模态 | 不支持 | 支持 |

**ACT 的优势：**
1. **Action Chunking**: 一次预测多步动作，提高时序一致性
2. **CVAE 结构**: 处理演示数据的多模态性
3. **Transformer**: 更好地建模长序列依赖

**选择建议：**
- 简单任务、快速验证 → BC
- 复杂任务、高精度要求 → ACT`,

  '数据采集命令': `**LeRobot 数据采集命令：**

\`\`\`bash
# 基础数据采集
python lerobot/scripts/control_robot.py record \\
  --robot-path lerobot/configs/robot/so100.yaml \\
  --repo-id your-name/task-name \\
  --num-episodes 50

# 带相机的数据采集
python lerobot/scripts/control_robot.py record \\
  --robot-path lerobot/configs/robot/so100.yaml \\
  --repo-id your-name/task-name \\
  --num-episodes 50 \\
  --fps 30

# 推送到 HuggingFace Hub
python lerobot/scripts/control_robot.py record \\
  --robot-path lerobot/configs/robot/so100.yaml \\
  --repo-id your-name/task-name \\
  --num-episodes 50 \\
  --push-to-hub 1
\`\`\`

**参数说明：**
- \`--num-episodes\`: 采集的轨迹数量
- \`--fps\`: 控制和录制的帧率
- \`--push-to-hub\`: 是否上传到 Hub`,

  'meta/info.json': `**关于 meta/info.json 问题：**

这个错误表示 LeRobot 找不到数据集的元数据文件。

**可能原因：**
1. 数据集路径不正确
2. 数据采集中断，文件未完整生成
3. 目录结构被破坏

**解决步骤：**

1. 检查数据集目录：
\`\`\`bash
ls -la ~/.cache/huggingface/lerobot/your-repo-id/
\`\`\`

2. 查看 meta 目录：
\`\`\`bash
ls -la ~/.cache/huggingface/lerobot/your-repo-id/meta/
\`\`\`

3. 如果目录为空，需要重新采集数据

**正确的目录结构：**
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

  '机械臂抖动': `**机械臂推理时抖动的解决方案：**

**原因分析：**
1. 控制频率不稳定
2. 模型输出噪声大
3. USB 通信延迟
4. 电机 PID 参数不当

**解决方法：**

1. **固定控制频率**
\`\`\`bash
python lerobot/scripts/control_robot.py record \\
  --fps 30 \\
  --policy-path your-checkpoint
\`\`\`

2. **添加动作平滑**
在推理代码中添加 EMA 滤波：
\`\`\`python
smoothed_action = 0.7 * action + 0.3 * prev_action
\`\`\`

3. **检查硬件连接**
   - 使用高质量 USB 线缆
   - 确保电源稳定

4. **调整电机参数**
   - 降低 P 增益可以减少抖动
   - 增加 D 增益改善阻尼`
}

export const learningPath = [
  { icon: 'Settings', title: '环境配置', description: 'Python 环境与 LeRobot 安装' },
  { icon: 'Cpu', title: '机械臂校准', description: '硬件连接与零点校准' },
  { icon: 'Database', title: '数据采集', description: '遥操作与数据录制' },
  { icon: 'Brain', title: 'ACT 训练', description: '模仿学习模型训练' },
  { icon: 'Rocket', title: '模型部署', description: '真实机械臂推理' },
  { icon: 'HelpCircle', title: '常见问题', description: '报错诊断与解决' }
]
