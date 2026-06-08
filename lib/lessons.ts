import type { Lesson } from './lesson-types'

/**
 * Interactive lessons keyed by chapter id.
 *
 * Authoring rules I follow:
 *   - Talk to the reader as "你". Never "用户". Never "学习者".
 *   - One new idea per card. If a card has 2 new ideas, split it.
 *   - Use everyday metaphors before any technical term. The term is the LAST
 *     thing the card introduces, not the first.
 *   - Emoji is fine in moderation. They function as visual anchors that the
 *     eye returns to.
 *   - When a beginner gets something wrong, never write "错了" — instead
 *     acknowledge why it's a reasonable guess, then steer.
 */

export const lessons: Record<number, Lesson> = {
  1: {
    chapterId: 1,
    title: '什么是模仿学习',
    estimatedMinutes: 7,
    cards: [
      {
        id: 'c1-01-hook',
        type: 'intro',
        emoji: '🦾',
        title: '想象一下',
        body: '你刚刚买了一台机械臂。\n\n它就放在桌上。\n\n你按下电源。**绿灯亮了**。',
        cta: '然后呢？'
      },
      {
        id: 'c1-02-it-cant',
        type: 'reveal',
        prompt: '你说: 「机械臂，给我倒杯水。」\n\n它会怎么反应？',
        revealCta: '看它怎么回应',
        reveal:
          '## 🦾 ⚙️ Beep.\n\n> 「我什么都没学过。」\n\n这是真的。一台刚出厂的机械臂只是**一堆能动的金属**。要让它做事，你得**教**它。\n\n问题是 —— 怎么教？',
        followCta: '我来想想 →'
      },
      {
        id: 'c1-03-which-path',
        type: 'choice',
        question: '你打算怎么教这个机械臂倒水？',
        options: [
          {
            id: 'manual',
            emoji: '📖',
            label: 'A. 给它写一本超详细的说明书',
            feedback:
              '哈哈，等你写完都退休了。\n\n光是「杯子在哪」就有 1000 种位置。**光线变了、桌上有杂物、杯子被人碰了**，每种都得写规则。\n\n这就是 1990 年代以前机器人专家做的事 —— 写不完。\n\n我们看 B 选项怎么样。'
          },
          {
            id: 'demo',
            emoji: '👋',
            label: 'B. 你亲手演示给它看，让它学',
            feedback:
              '✨ **就是这个思路。**\n\n你不告诉它规则，你**示范**给它看。演示 50 次「怎么倒水」，让它自己悟。\n\n这个方法有个名字 ——',
            correct: true
          },
          {
            id: 'chatgpt',
            emoji: '🤖',
            label: 'C. 我问 ChatGPT 帮我教',
            feedback:
              '哈哈想得美。ChatGPT 不会动你家机械臂。\n\n但你的方向是对的 —— **让机器自己学** 比 **写规则** 强。看 B 选项。'
          }
        ]
      },
      {
        id: 'c1-04-define-il',
        type: 'reveal',
        prompt: '把这个名字钉死在脑子里：',
        revealCta: '记下它',
        reveal:
          '## 模仿学习 \n### Imitation Learning (IL)\n\n> 给机器看很多「人怎么做」的演示，让它自己学到一个**策略**。\n\n**策略 (policy)** 是个翻译器：\n\n```\n看到当前情况  →  输出下一步该怎么动\n```\n\n听起来简单。但马上你会发现一个**致命问题**...',
        followCta: '致命问题是什么 →'
      },
      {
        id: 'c1-05-the-trap',
        type: 'choice',
        question:
          '你演示了 5 次倒水，机器人学会了。\n\n第 6 次，你**把杯子往左挪了 0.5 厘米**。\n\n猜猜会怎样？',
        options: [
          {
            id: 'perfect',
            label: '🎯 完美完成',
            feedback:
              '可惜不是。\n\n机器人从来没见过「杯子稍微偏一点」的画面 —— 它会觉得场景有点不对劲，做出来的动作会**偏一点点**。'
          },
          {
            id: 'wobble',
            label: '🤏 动作稍微歪了一点',
            feedback:
              '对了。但故事**还没完**。\n\n这「稍微歪了」会触发一个**连锁反应**。揭晓 →',
            correct: true
          },
          {
            id: 'crash',
            label: '💥 完全失败',
            feedback:
              '有点夸张。\n\n第 6 次还不至于完全失败。但**第 30 次**呢？很可能。原因是 ——'
          }
        ]
      },
      {
        id: 'c1-06-compounding',
        type: 'reveal',
        prompt: '这个连锁反应有个名字。它是模仿学习**最大的敌人**。',
        revealCta: '揭晓敌人的名字',
        reveal:
          '## 复合误差 🌨️\n### Compounding Error\n\n```\n第 6 次  → 偏 0.5 度\n第 7 次  → 偏 1.5 度  (因为画面比第 6 次更不对)\n第 8 次  → 偏 4   度\n第 9 次  → 完全跑偏\n```\n\n**误差像雪球一样越滚越大。**\n\n好消息：现代算法 (ACT、Diffusion Policy) 都有办法治它。后面 7 章你会一点点学会怎么对付它。',
        followCta: '看一张图整理一下 →'
      },
      {
        id: 'c1-07-pipeline-viz',
        type: 'viz',
        title: '一张图看清整个流程',
        body: '别想着记，看图就行。所有花哨算法都在做同一件事 ——',
        mermaid: `flowchart LR
    A["👤 你 (演示)"] -->|"录 50 次"| B["📦 数据集"]
    B -->|"训练"| C["🧠 策略"]
    C -->|"输出动作"| D["🦾 机械臂"]
    D -.->|"新情况"| C
    style A fill:#7c5cff,stroke:#7c5cff,color:#fff
    style C fill:#22c55e,stroke:#22c55e,color:#fff
    style D fill:#0ea5e9,stroke:#0ea5e9,color:#fff`,
        caption: '人产生演示 → 数据集训练出策略 → 策略指挥机械臂 → 机械臂遇到新情况 → 喂回策略。整个 IL 都是这个循环。'
      },
      {
        id: 'c1-08-vocab',
        type: 'match',
        prompt: '速记 3 个词。把左边和右边连起来：',
        pairs: [
          { left: '状态 s', right: '机械臂现在的关节角度' },
          { left: '动作 a', right: '下一刻关节要去的角度' },
          { left: '策略 π', right: '看到 s 就输出 a 的翻译器' }
        ]
      },
      {
        id: 'c1-09-numeric',
        type: 'numeric',
        question:
          'SO101 机械臂有 **6 个关节**。\n\n你以 **30 fps** 录一段 **10 秒** 的演示。\n\n这段演示包含多少个 (s, a) 样本对？',
        answer: 300,
        unit: '对',
        hint: '帧率 × 秒数 = 总帧数。每一帧就是一个 (s, a) 对。',
        explanation:
          '## ✅ 30 × 10 = **300 对**\n\n顺便说一下:\n\n- 每对的总维度 = 6 + 6 = **12 维**\n- 整段用 float32 存 = 300 × 12 × 4 = **14.4 KB**\n\n**小到不可思议吧？** 所以 LeRobot 几千条演示也只占几百 MB —— 真正占空间的是**相机视频帧**。'
      },
      {
        id: 'c1-10-bc-vs-act',
        type: 'mcq',
        question: '复合误差这个雪球，**怎么治**？',
        options: [
          {
            id: 'more-data',
            label: '采更多数据，演示一万次'
          },
          {
            id: 'predict-chunks',
            label: '让策略一次预测一**段**动作（不是一步），靠未来动作的一致性消化误差'
          },
          {
            id: 'just-restart',
            label: '出错就重启机械臂'
          },
          {
            id: 'use-llm',
            label: '让 ChatGPT 实时控制它'
          }
        ],
        correctOptionId: 'predict-chunks',
        explanation:
          '## 一次预测一段动作\n\n这就是 **ACT (Action Chunking Transformer)** 的核心思路：\n\n```\nBC:  看一帧 → 出一步动作 → 出错就累积\nACT: 看一帧 → 出未来 100 步动作 → 段内自洽\n```\n\n后面**第 7 章** 我们专门讲 ACT。**先记住这个名字就行**，原理慢慢消化。'
      },
      {
        id: 'c1-11-recap',
        type: 'recap',
        title: '🧠 本课你已经学会了:',
        bullets: [
          '🎯 **模仿学习** = 给机器看演示，让它学策略',
          '📖 你不用写规则，机器自己悟',
          '⚠️ **复合误差** = 误差像雪球越滚越大 —— BC 的最大敌人',
          '🧊 **ACT** 通过「一次预测一段动作」治雪球',
          '📐 **状态 s** = 关节角度  ·  **动作 a** = 下一刻角度  ·  **策略 π** = 翻译器'
        ]
      },
      {
        id: 'c1-12-completion',
        type: 'completion',
        title: '🎉 第 1 课通关',
        body:
          '你已经搞懂了模仿学习是什么、为什么会失败、为什么需要 ACT。\n\n下一课我们打开 **SO101 的硬件** —— 看 Leader 臂和 Follower 臂是怎么生成「演示数据」的。\n\n继续吗？',
        nextChapterId: 2
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 2 — SO101 硬件长什么样                                     */
  /* ────────────────────────────────────────────────────────────────── */

  2: {
    chapterId: 2,
    title: 'SO101 硬件长什么样',
    estimatedMinutes: 8,
    cards: [
      {
        id: 'c2-01-package',
        type: 'intro',
        emoji: '📦',
        title: '你订的机械臂今天到了',
        body: '快递员把一个比想象中**还大**的箱子放在你桌上。\n\n你拆开。',
        cta: '看里面是什么 →'
      },
      {
        id: 'c2-02-unbox',
        type: 'reveal',
        prompt: '盒子打开，你看到了 ——',
        revealCta: '揭晓',
        reveal:
          '## 🦾  🦾\n\n**两条**机械臂。不是一条。\n\n它们外观一模一样：一样的关节数、一样的线缆、一样的爪子。\n\n但功能完全不同。**这是 SO101 的核心设计**。',
        followCta: '为什么是两条？ →'
      },
      {
        id: 'c2-03-why-two',
        type: 'choice',
        question: '你猜为什么 SO101 要做成两条臂？',
        options: [
          {
            id: 'two-hands',
            emoji: '🤲',
            label: 'A. 像人有两只手，能配合抓东西',
            feedback:
              '这是 ALOHA 那种**双手协作任务**才需要的设定。SO101 默认是一条人手操作 + 一条机器复制，不是双手抓物。\n\n看 B 选项 →'
          },
          {
            id: 'leader-follower',
            emoji: '👋',
            label: 'B. 一条让人手动操作，另一条复制人的动作',
            feedback:
              '✨ **答对了。**\n\n你手握一条臂演示动作，第二条臂**实时复制**你的关节角度。这就是采集训练数据的方式 —— 让你「演示」给机器看。',
            correct: true
          },
          {
            id: 'spare',
            emoji: '🔁',
            label: 'C. 一条是备用，万一另一条坏了',
            feedback:
              '买两条机械臂作备份太奢侈了 —— 备份一般是买备用电机。\n\n这里两条是**协同工作**的。看 B 选项 →'
          }
        ]
      },
      {
        id: 'c2-04-define',
        type: 'reveal',
        prompt: '两条臂的角色名字 ——',
        revealCta: '记下',
        reveal:
          '## 主臂 vs 从臂\n\n- **Leader（主臂）**：你的手握着它，**人手动操作**。它感受你的关节意图。\n- **Follower（从臂）**：复制 Leader 的关节角度，**实时跟随**。它给你看「机器在做什么」。\n\n你拿 Leader 演示「拿杯子」的动作 → 电脑同时记录 Leader 的关节角（这就是 `action` a）+ 让 Follower 跟随（让你看到效果是否对）。\n\n**这就是数据采集的全部秘密。**',
        followCta: '看一张图把流程钉死 →'
      },
      {
        id: 'c2-05-topology',
        type: 'viz',
        title: 'Leader-Follower 是怎么连起来的',
        mermaid: `flowchart LR
    H["👋 你的手"] -->|"扳动关节"| L["🦾 Leader (主臂)"]
    L -->|"USB"| PC["💻 电脑"]
    PC -->|"USB"| F["🦾 Follower (从臂)"]
    PC -->|"录数据"| D["📦 数据集"]
    style L fill:#7c5cff,stroke:#7c5cff,color:#fff
    style F fill:#0ea5e9,stroke:#0ea5e9,color:#fff
    style PC fill:#22c55e,stroke:#22c55e,color:#fff`,
        caption: '你 → Leader → USB → 电脑 → USB → Follower。电脑同时把 Leader 的关节角写入数据集。整个链路 30 fps 不停转。'
      },
      {
        id: 'c2-06-tell-apart',
        type: 'mcq',
        question: '问题：摆在你面前两条一模一样的臂。**怎么知道哪条是 Leader、哪条是 Follower？**',
        options: [
          { id: 'color', label: '看颜色 —— 厂家肯定标了' },
          { id: 'label', label: '看贴纸 —— Leader 那条会贴 "L"' },
          { id: 'cable', label: '看你怎么接 —— 你接到「Leader 端口」的就是 Leader' },
          { id: 'feel', label: '用手扳一下 —— Leader 没有上电会比较松' }
        ],
        correctOptionId: 'cable',
        explanation:
          '## 角色由「软件配置」决定\n\nSO101 出厂时两条臂**完全一样**。哪条是 Leader、哪条是 Follower 是**你在配置文件里指定的** —— 把哪条接到哪个 USB 端口 + 配置文件里写哪个端口是 leader、哪个是 follower。\n\n实际操作时你会先用线把两条都接电脑，然后跑一个工具看哪个 ttyUSB 是哪条，然后在 yaml 里写明白。下一课我们就会做这个。'
      },
      {
        id: 'c2-07-list-ports',
        type: 'command',
        title: '第一行真正的命令',
        intro: '在 Linux / macOS 上，机械臂连进 USB 后会变成一个「文件」叫 `/dev/ttyUSB?`。\n\n这条命令列出所有这种文件：',
        description: '在终端里跑：',
        code: 'ls /dev/tty*',
        expectedOutput: '/dev/tty   /dev/ttyS0   /dev/ttyUSB0   /dev/ttyUSB1',
        tip: '看到 **ttyUSB0** 和 **ttyUSB1** 这两行就是你的两条机械臂。其他 `ttyS0` `tty` 之类是系统自带的，跟你无关。'
      },
      {
        id: 'c2-08-permission',
        type: 'mcq',
        question:
          '你跑完上面那条命令，发现机械臂在列表里。\n\n然后试着访问它，**报错** ——\n\n```\nPermission denied: /dev/ttyUSB0\n```\n\n怎么办？',
        options: [
          { id: 'reinstall', label: '重装系统 / 重装驱动' },
          { id: 'sudo-always', label: '以后所有命令都加 sudo' },
          { id: 'add-group', label: '把自己加进 dialout 组，重新登录' },
          { id: 'change-cable', label: '换条 USB 线' }
        ],
        correctOptionId: 'add-group',
        explanation:
          '## dialout 组 = 操作串口的权限\n\nLinux 上访问 `/dev/ttyUSB*` 需要属于 `dialout` 组（Ubuntu）或 `uucp` 组（Arch）。\n\n你的账号默认**不在这个组**，所以系统拒绝你访问。修复 = 加入这个组。'
      },
      {
        id: 'c2-09-fix-permission',
        type: 'command',
        title: '修这个权限错误',
        description: '一次性修好，以后开机自动有权限：',
        code: 'sudo usermod -a -G dialout $USER',
        expectedOutput: '(没有输出就是成功了)',
        warning: '改完**必须注销重新登录**才生效。或者直接重启电脑。临时凑合不重启可以 `newgrp dialout`，但只在当前 shell 有效。',
        tip: '验证生效了：`groups` 命令应该列出 dialout。'
      },
      {
        id: 'c2-10-dof',
        type: 'numeric',
        question: 'SO101 一条臂有多少个**自由度**（可独立运动的关节）？',
        answer: 6,
        unit: '个',
        hint: '看一眼图里数：底座转一个、肩膀一个、肘一个、手腕两个、爪子一个。',
        explanation:
          '## ✅ 6 个自由度\n\n这是工业机械臂的「标配」自由度数 —— 6 个足以让末端（爪子）到达**三维空间任意位置**（x, y, z）+ **任意姿态**（pitch, yaw, roll）。\n\n这也是为什么状态 s 是 6 维 —— 一个关节一维。两条臂数据合起来就是 12 维。'
      },
      {
        id: 'c2-11-vocab',
        type: 'match',
        prompt: '把这一课的三个核心词钉死：',
        pairs: [
          { left: 'Leader', right: '你手动操作的那条臂' },
          { left: 'Follower', right: '复制 Leader 关节角的那条臂' },
          { left: '/dev/ttyUSB0', right: '机械臂在系统里的文件名' }
        ]
      },
      {
        id: 'c2-12-recap',
        type: 'recap',
        title: '🧠 本课你已经搞懂:',
        bullets: [
          '🦾 **SO101 是两条一样的臂** —— 角色由你接哪个 USB 决定',
          '👋 **Leader** 你手动操作；**Follower** 实时复制 Leader 的关节角',
          '📐 一条臂 **6 个自由度** —— 这就是状态/动作向量为 6 维的原因',
          '🔌 机械臂在 Linux 里是 `/dev/ttyUSB*` 这样的「文件」',
          '🔑 `Permission denied` ➜ `sudo usermod -a -G dialout $USER` + 重新登录'
        ]
      },
      {
        id: 'c2-13-completion',
        type: 'completion',
        title: '🎉 第 2 课通关',
        body:
          '你认识了硬件，知道了 Leader-Follower 是怎么回事。\n\n下一课开始**真正动手装软件** —— 不靠物理硬件也能做完。',
        nextChapterId: 3
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 3 — LeRobot 环境安装                                       */
  /* ────────────────────────────────────────────────────────────────── */

  3: {
    chapterId: 3,
    title: '装好 LeRobot 环境',
    estimatedMinutes: 10,
    cards: [
      {
        id: 'c3-01-intro',
        type: 'intro',
        emoji: '💻',
        title: '硬件先放一边',
        body:
          '这一课**完全不需要机械臂**。\n\n我们装好软件环境 —— 这是 80% 初学者卡壳的地方。我们一步步走，不让你卡。',
        cta: '走起 →'
      },
      {
        id: 'c3-02-python-where',
        type: 'choice',
        question: '你打算把 Python 装在哪？',
        options: [
          {
            id: 'system',
            emoji: '💀',
            label: 'A. 直接用系统自带的 Python，pip install 一把梭',
            feedback:
              '别这样。系统 Python 是给操作系统自己用的 —— 你乱装包会**污染系统**，几天后启动器就坏给你看。这是 90% Python 初学者第一个跌坑。\n\n看 C 选项 →'
          },
          {
            id: 'venv',
            emoji: '🥈',
            label: 'B. 用 Python 自带的 venv',
            feedback:
              'venv 可以用，但**只隔离 Python 包**，不隔离 Python 版本本身。如果你的系统装的是 Python 3.9 但 LeRobot 要 3.10，你还是搞不定。\n\nC 选项更稳。'
          },
          {
            id: 'conda',
            emoji: '🥇',
            label: 'C. 用 conda 创建一个完全隔离的环境',
            feedback:
              '✨ **正确答案**。\n\nconda 不只隔离包，还隔离 **Python 版本本身**。你的系统装啥版本 conda 都不管，conda 给你单独装 3.10。出错了？删环境重来，**系统毫发无伤**。',
            correct: true
          }
        ]
      },
      {
        id: 'c3-03-stack-viz',
        type: 'viz',
        title: '为什么 conda 这么管用',
        mermaid: `flowchart TB
    OS["💻 操作系统<br/>(Ubuntu / macOS)"]
    OS --> SysPy["🐍 系统 Python 3.x<br/>(操作系统自己用的)"]
    OS --> Conda["📦 conda 管理器"]
    Conda --> Env1["🟢 conda env: lerobot<br/>Python 3.10 + 100+ 包"]
    Conda --> Env2["🟡 conda env: other<br/>Python 3.11 + 别的包"]
    style SysPy fill:#7f1d1d,stroke:#7f1d1d,color:#fff
    style Env1 fill:#15803d,stroke:#15803d,color:#fff`,
        caption: '系统 Python（红）你**别碰**。conda 给你建独立环境（绿）—— 想装啥装啥，崩了删掉重建。'
      },
      {
        id: 'c3-04-create-env',
        type: 'command',
        title: '创建 LeRobot 专属环境',
        description: '一行命令搞定：',
        code: 'conda create -n lerobot python=3.10 -y',
        expectedOutput:
          '...\nCollecting package metadata: done\n...\nPreparing transaction: done\nVerifying transaction: done\nExecuting transaction: done\n\n# To activate this environment, use\n#     $ conda activate lerobot',
        tip: '`-n lerobot` 是环境名（你以后激活时用的）。`python=3.10` 指定版本。`-y` 表示「别问我了，直接装」。',
        warning: '如果你**没装 conda**，先去 https://docs.conda.io/en/latest/miniconda.html 下载 Miniconda（不要装 Anaconda，太重了）。'
      },
      {
        id: 'c3-05-install',
        type: 'command',
        title: '激活环境 + 装 LeRobot',
        description: '激活，然后从 GitHub 直接装：',
        code:
          'conda activate lerobot\ngit clone https://github.com/huggingface/lerobot.git\ncd lerobot\npip install -e .',
        expectedOutput:
          '(lerobot) $ \n... (下载 + 编译大概 3-5 分钟) ...\nSuccessfully installed lerobot torch numpy ...',
        tip: '注意命令行提示符前面多了 `(lerobot)` —— 这表示**当前在 lerobot 环境里**。以后每个新终端都要先 `conda activate lerobot`。'
      },
      {
        id: 'c3-06-success-check',
        type: 'mcq',
        question: '`pip install -e .` 跑完没报错。**这是不是就成功了？**',
        options: [
          { id: 'yes', label: '是 —— 没报错就是成功' },
          { id: 'verify', label: '不一定 —— 还得验证 PyTorch 能用 + CUDA（如果有 GPU）' },
          { id: 'restart', label: '是 —— 但要重启电脑才能生效' }
        ],
        correctOptionId: 'verify',
        explanation:
          '## 装完 ≠ 能用\n\nLeRobot 自己安装成功不等于它的依赖（PyTorch、CUDA）也都对上了。你得**主动跑一行代码**验证 PyTorch 能用、GPU 能被认到。\n\n下一卡就是这条验证命令。'
      },
      {
        id: 'c3-07-verify',
        type: 'command',
        title: '验证 PyTorch + CUDA',
        description: '一行命令同时验证两件事：PyTorch 装好了 + GPU 能用：',
        code: 'python -c "import torch; print(torch.cuda.is_available())"',
        expectedOutput: 'True',
        tip: '输出 **True** = 完美，GPU 能用。\n输出 **False** = PyTorch 装对了，但**没找到 GPU**（可能你没显卡，或者驱动没装）。'
      },
      {
        id: 'c3-08-no-cuda',
        type: 'choice',
        question: '上面那个验证输出了 **False**。怎么办？',
        options: [
          {
            id: 'panic',
            label: 'A. 全部删掉重装一遍',
            feedback:
              '没必要。`False` 不代表 PyTorch 装错了 —— 它只是说**没找到能用的 GPU**。删了重装也是这个结果。\n\n看 B 选项 →'
          },
          {
            id: 'cpu-ok',
            label: 'B. 没 GPU 也能跑，只是慢',
            feedback:
              '✨ **对**。\n\nLeRobot 自动 fallback 到 CPU。训练 ACT 在 CPU 上跑也行，只是慢大概 **10-30 倍**。前 6 章的内容（数据采集、推理）CPU 完全够。第 7 章训练才会想要 GPU。\n\n现阶段：继续往下走，不用纠结。',
            correct: true
          },
          {
            id: 'change-os',
            label: 'C. 必须 Linux 不能 Windows',
            feedback:
              '其实 Windows + WSL2 也能跑 CUDA。macOS 没 CUDA 但有 MPS（Apple 自家 GPU 加速）。系统不是关键。\n\n看 B 选项 →'
          }
        ]
      },
      {
        id: 'c3-09-oom',
        type: 'mcq',
        question:
          '等你后面真的跑训练，你**几乎一定**会碰到这个报错：\n\n```\nCUDA out of memory\n```\n\n第一时间应该试什么？',
        options: [
          { id: 'reboot', label: '重启电脑' },
          { id: 'smaller-batch', label: '把 batch_size 改小' },
          { id: 'buy-gpu', label: '换张更大显存的卡' },
          { id: 'restart-python', label: '重启 Python 进程' }
        ],
        correctOptionId: 'smaller-batch',
        explanation:
          '## OOM ≈ batch 太大\n\n90% 的 CUDA OOM 是 batch_size 过大。你的 GPU 显存不够装那么多样本同时计算。\n\n**应急三步：**\n1. `--batch_size=4`（先把 batch 调小，减半甚至降到 2）\n2. 还不行？关掉多余摄像头、调低输入图像分辨率，让每个样本更小\n3. 还不行？换更小的 policy，或租一张显存更大的 GPU\n\n90% 情况下第 1 步就够。第 7 章再细讲。'
      },
      {
        id: 'c3-10-recap',
        type: 'recap',
        title: '🧠 你已经做到了:',
        bullets: [
          '✅ 装了 **conda**，知道为啥不能用系统 Python',
          '✅ 创建了 **lerobot 环境**，里面是 Python 3.10',
          '✅ 装了 **LeRobot** 本体 + 所有依赖',
          '✅ 验证了 **PyTorch 能用**',
          '✅ 提前知道了 **CUDA OOM** 的应急方案'
        ]
      },
      {
        id: 'c3-11-completion',
        type: 'completion',
        title: '🎉 第 3 课通关',
        body:
          '环境装好了。这一关劝退 80% 的人 —— 你过了。\n\n下一课我们让电脑**真的看到**机械臂的两条 USB 串口，并且做关键的「校准」步骤。',
        nextChapterId: 4
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 4 — 端口识别 + 机械臂校准                                  */
  /* ────────────────────────────────────────────────────────────────── */

  4: {
    chapterId: 4,
    title: '端口识别 + 机械臂校准',
    estimatedMinutes: 8,
    cards: [
      {
        id: 'c4-01-intro',
        type: 'intro',
        emoji: '🔌',
        title: '两条 USB 都接上了',
        body: '电脑认到了。`ls /dev/tty*` 也能看到 `ttyUSB0` 和 `ttyUSB1`。\n\n**但你不知道哪个是 Leader、哪个是 Follower。**',
        cta: '怎么分辨？ →'
      },
      {
        id: 'c4-02-pull-one',
        type: 'command',
        title: '土办法：拔一根',
        description: '最简单的分辨方法 —— 看哪个文件消失：',
        code: 'ls /dev/tty*\n# (然后拔掉 Leader 那条 USB)\nls /dev/tty*',
        expectedOutput:
          '第一次:  ttyUSB0  ttyUSB1\n第二次:  ttyUSB0           ← Leader 是 ttyUSB1',
        tip: '简单粗暴但**绝对可靠**。第一次插的时候记一下 Leader 是哪个。'
      },
      {
        id: 'c4-03-better-way',
        type: 'mcq',
        question: '有没有不用拔线、不用手动看的方法？',
        options: [
          { id: 'gpt', label: '问 ChatGPT' },
          { id: 'find-motors', label: 'LeRobot 自带一个 find_motors 工具，扫一下两个端口告诉你' },
          { id: 'guess', label: '猜（USB0 一般是 Leader）' },
          { id: 'sticker', label: '让厂家寄之前贴个标' }
        ],
        correctOptionId: 'find-motors',
        explanation:
          '## LeRobot 自带探测工具\n\n命令是 `lerobot-find-port`。它会**逐个端口**询问机械臂「你是几号电机？」然后告诉你哪个端口对应哪条臂。\n\n手动拔线 ✅ 简单但要动手  \nfind_motors ✅ 自动但记不住命令'
      },
      {
        id: 'c4-04-config',
        type: 'command',
        title: '把结果写进命令参数',
        intro: '知道哪个 ttyUSB 是哪个角色后，把它写进新版 LeRobot CLI 参数：',
        description: '后续命令里带上这两个端口：',
        code:
          '--robot.port=/dev/ttyACM0\n--teleop.port=/dev/ttyACM1',
        tip: '`--robot.port` 是 Follower 端口，`--teleop.port` 是 Leader 端口。后面的校准、遥操作、录制都沿用这个对应关系。',
        warning: '如果你重启电脑后再插，ttyACM0 / ttyACM1 的顺序可能颠倒。最稳的是先跑 `ls /dev/tty*` 再复制真实端口。'
      },
      {
        id: 'c4-05-calibrate-why',
        type: 'reveal',
        prompt:
          '现在两条臂都被电脑认到了。\n\n**你能直接开始训练吗？**\n\n答案是：还差一步。这一步叫 ——',
        revealCta: '揭晓',
        reveal:
          '## 校准 (Calibration) 🎯\n\n机械臂出厂时**每个电机的零点位置**都有出厂误差（机械装配公差）。\n\n意思是：你说「让关节 1 去到 30 度」，**实际**它可能去了 31 度或 28 度。\n\n校准 = 让你的电脑知道**「真正的 0 度」**对应每个电机读数是多少。\n\n如果不校准 ——\n- Follower 跟随 Leader 时会**偏一截**\n- 你录的演示数据**全是错的**（Leader 读数 ≠ Follower 实际姿态）\n- 训练出来的模型必然崩\n\n所以这一步**跳不过去**。',
        followCta: '看看校准前后的差别 →'
      },
      {
        id: 'c4-06-calibrate-viz',
        type: 'viz',
        title: '校准前 vs 校准后',
        mermaid: `flowchart LR
    subgraph Before ["未校准"]
        B1["Leader 读数: 30度"] -.->|"不一致!"| B2["Follower 实际: 33度"]
    end
    subgraph After ["校准后"]
        A1["Leader 读数: 30度"] -->|"完全一致 ✓"| A2["Follower 实际: 30度"]
    end
    style Before fill:#fef2f2,stroke:#dc2626
    style After fill:#f0fdf4,stroke:#16a34a`,
        caption: '校准前 Leader-Follower 角度有 1-5 度偏差。校准后两者完全一致。'
      },
      {
        id: 'c4-07-calibrate-cmd',
        type: 'command',
        title: '跑校准',
        description: '一条命令开始校准过程：',
        code:
          'lerobot-calibrate \\\n  --robot.type=so101_follower \\\n  --robot.port=/dev/ttyACM0 \\\n  --robot.id=so101_follower',
        expectedOutput:
          'Calibrating leader_arms/main...\n[INFO] Move arm to fully-extended pose, press Enter...\n[INFO] Move arm to home pose, press Enter...\n[INFO] Saving calibration to ~/.cache/.../calibration.json\nDone!',
        tip: '它会一步步引导你：让你把臂**手动摆到指定姿态**（如完全伸展、回零位），每摆一个姿态按一次 Enter。整个过程 1-2 分钟。',
        warning: '摆姿态时**用手轻柔扳**。SO101 电机不带阻尼，硬扳可能损坏齿轮。'
      },
      {
        id: 'c4-08-calibrate-fail',
        type: 'mcq',
        question: '校准失败最常见的原因是什么？',
        options: [
          { id: 'cuda', label: 'CUDA 不可用' },
          { id: 'wrong-pose', label: '你摆的姿态不准（比如「完全伸展」其实没伸到位）' },
          { id: 'wifi', label: 'Wi-Fi 太慢' },
          { id: 'python', label: 'Python 版本不对' }
        ],
        correctOptionId: 'wrong-pose',
        explanation:
          '## 物理姿态准 > 软件配置\n\n校准依赖你摆出的物理姿态作为「参考点」。你摆得不准（如「完全伸展」实际只伸了 80%），后面所有读数都偏。\n\n**修复**：重新跑校准命令，这次**严格按图示**摆姿态。可以拿尺子比对一下。\n\n校准数据保存在 `~/.cache/huggingface/lerobot/calibration/` 下，重做时旧的会被覆盖，不会污染。'
      },
      {
        id: 'c4-09-motor-count',
        type: 'numeric',
        question: 'SO101 一条臂有 6 个关节。校准时**每个关节都要单独校准**。\n\n你校准一条臂总共要校准多少个电机？',
        answer: 6,
        unit: '个',
        hint: '关节数 = 电机数。',
        explanation:
          '## ✅ 6 个\n\n每个关节一个电机。校准两条臂就是 12 个。\n\n好消息是：脚本会**自动一个个走完**，你不用手动选哪个电机。'
      },
      {
        id: 'c4-10-when-recalibrate',
        type: 'choice',
        question: '校准做完一次后，多久要重做？',
        options: [
          {
            id: 'never',
            label: 'A. 永远不用 —— 一次终身',
            feedback:
              '不对。机械臂掉一下、拆装一次电机、运输颠簸都可能让零点偏。\n\n看 B 选项 →'
          },
          {
            id: 'each-power-on',
            label: 'B. 每次开机都要重做',
            feedback:
              '太频繁了。校准数据存在硬盘文件里，关机不丢。\n\n看 C 选项 →'
          },
          {
            id: 'on-change',
            label: 'C. 只在硬件有变动时（换电机 / 重装 / 摔过）',
            feedback:
              '✨ **对**。\n\n校准数据存在 `~/.cache/.../calibration.json`，只要硬件没动过，下次开机依然有效。\n\n但只要你：换电机、拆开重装、运输过程颠簸 —— 都建议重新校准一次。3 分钟的事。',
            correct: true
          }
        ]
      },
      {
        id: 'c4-11-recap',
        type: 'recap',
        title: '🧠 这一关你已经搞定:',
        bullets: [
          '🔍 学会了 **ls /dev/tty\\*** 看串口',
          '⚙️ 知道了 LeRobot 自带 **find_motors** 工具',
          '📝 会用 **--robot.port / --teleop.port** 写清两条臂端口',
          '🎯 理解了 **校准** = 让电脑知道每个电机的真零点',
          '🔁 知道校准 **只在硬件变动时**才需要重做'
        ]
      },
      {
        id: 'c4-12-completion',
        type: 'completion',
        title: '🎉 第 4 课通关',
        body: '硬件 + 软件都准备好了。\n\n下一课就是**整套流程最爽的部分** —— 真的拿着机械臂演示动作，让电脑录下来。',
        nextChapterId: 5
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 5 — 遥操作 + 数据采集                                      */
  /* ────────────────────────────────────────────────────────────────── */

  5: {
    chapterId: 5,
    title: '遥操作 + 录数据',
    estimatedMinutes: 12,
    cards: [
      {
        id: 'c5-01-intro',
        type: 'intro',
        emoji: '🎬',
        title: '终于到了好玩的部分',
        body: '现在你要**亲手扳动 Leader**，让 Follower 跟随，电脑同步把动作录下来。\n\n这就是给 AI 看的「演示数据」。',
        cta: '开录 →'
      },
      {
        id: 'c5-02-teleop-cmd',
        type: 'command',
        title: '第一步：先纯遥操作试试',
        intro: '不录数据，先验证 Leader → Follower 同步工作正常。',
        description: '跑这条命令：',
        code:
          'lerobot-teleoperate \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --display_data=true',
        expectedOutput: '[INFO] Connected to leader_arms/main\n[INFO] Connected to follower_arms/main\n[INFO] Teleoperation started. Move the leader arm.',
        tip: '现在你拿手扳 Leader 关节 → Follower 应该**同步动**。延迟 < 50ms 才算正常。\n\n试个 30 秒，确认手感对了再 Ctrl+C 退出。'
      },
      {
        id: 'c5-03-sync-feel',
        type: 'choice',
        question: '你扳 Leader 时，Follower 跟随感**明显延迟**或**抖动**。怎么办？',
        options: [
          {
            id: 'higher-fps',
            label: 'A. fps 调到 60 让它更跟手',
            feedback:
              '调高 fps 反而可能更卡 —— 因为 USB 带宽和计算来不及。\n\n看 C 选项 →'
          },
          {
            id: 'reboot',
            label: 'B. 重启机械臂电源',
            feedback:
              '偶尔有用，但不是根本解法。\n\n看 C 选项 →'
          },
          {
            id: 'lower-fps',
            label: 'C. fps 调到 20-30，确认 USB 没接在 hub 上',
            feedback:
              '✨ **对**。\n\n**fps 越高越占带宽**。30 fps 是公认的甜点。再低人眼能感觉到分帧，再高 USB 跟不上。\n\n另外：把机械臂**直接插主板 USB 接口**，不要走 USB hub 或扩展坞。延迟会大幅降低。',
            correct: true
          }
        ]
      },
      {
        id: 'c5-04-record-cmd',
        type: 'command',
        title: '真的开始录数据',
        intro: 'Teleop 手感对了，切换到 record 模式。这次会把数据保存下来。',
        description: '完整命令：',
        code:
          'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --dataset.repo_id=your-name/so101-pick-cup \\\n  --dataset.num_episodes=50 --dataset.fps=30 \\\n  --display_data=true',
        expectedOutput:
          'Recording episode 1/50...\n[INFO] Press Enter when ready, Ctrl+C to abort.\nEpisode 1 saved (132 frames, 4.4 s)',
        tip: '`--dataset.repo_id` 是你自己起的数据集名字（任意，不用真的传到 HuggingFace）。\n`--dataset.num_episodes` 总共要录多少条。\n`--dataset.fps` 控制频率，30 推荐。'
      },
      {
        id: 'c5-05-how-many',
        type: 'mcq',
        question: '一个**简单任务**（比如 pick-and-place 一个杯子），录多少条演示够？',
        options: [
          { id: 'ten', label: '10 条 —— ACT 这么强应该够了' },
          { id: 'fifty', label: '50 条 —— 一般够用' },
          { id: 'hundred', label: '200+ 条 —— 越多越好' },
          { id: 'thousand', label: '1000 条 —— 跟 GPT 一样要大数据' }
        ],
        correctOptionId: 'fifty',
        explanation:
          '## 简单任务 ≈ 50 条\n\n经验值：\n\n- **简单 pick-place**: 50 条够（10 条会过拟合，过不了几次实测）\n- **中等难度**（如插 USB）：100-200 条\n- **复杂任务**（如折毛巾）：300+ 条\n\n**质量比数量重要** —— 50 条**多样化**的演示 > 200 条都长得一样的演示。下一卡讲多样化。'
      },
      {
        id: 'c5-06-same-or-vary',
        type: 'choice',
        question:
          '你打算录 50 条「拿杯子」的演示。**杯子要每次放同一个位置，还是每次稍微变？**',
        options: [
          {
            id: 'same',
            label: 'A. 每次同一位置 —— 才能学得「准」',
            feedback:
              '机器人会**精确学会**「从 X = 30 cm 拿杯子」。\n\n但下次你把杯子挪到 X = 32 cm？**完全不会**。这叫**过拟合**。\n\n看 B 选项 →'
          },
          {
            id: 'vary',
            label: 'B. 每次稍微变位置、变角度、变光线',
            feedback:
              '✨ **对**。\n\n变化才是泛化的关键。第 6 次杯子向左 1 cm，第 7 次向后 2 cm，第 15 次故意把手放慢一点。\n\n这些**自然变化**让训练分布更宽，模型才不会一遇到稍微不同的情况就崩。',
            correct: true
          }
        ]
      },
      {
        id: 'c5-07-vary-detail',
        type: 'reveal',
        prompt: '具体要怎么「变」？',
        revealCta: '看清单',
        reveal:
          '## 录数据的「故意变化」清单\n\n1. **物体位置**：每次把杯子放在略不同的位置（±3-5 cm）\n2. **物体朝向**：杯柄朝左/朝右/朝你都录一些\n3. **起始姿态**：机械臂不一定每次都从「家位置」开始\n4. **动作速度**：偶尔慢一点、偶尔快一点\n5. **环境**：换个时段录（光线不同）、桌面上摆点干扰物\n6. **轻度失败也录**：杯子掉了重新捡起来这种**也是有价值的演示**（教模型怎么从错误中恢复）\n\n**目标**：让你录的 50 条演示，**没有任意两条长得完全一样**。',
        followCta: '继续 →'
      },
      {
        id: 'c5-08-frames',
        type: 'numeric',
        question: '你在 30 fps 录了一条 5 秒的演示。**这条演示总共有多少帧？**',
        answer: 150,
        unit: '帧',
        hint: '帧率 × 秒数 = 帧数。',
        explanation:
          '## ✅ 30 × 5 = 150 帧\n\n每一帧 = 一对 (s, a)。\n\n所以这条演示给训练贡献了 **150 个样本**。50 条 5 秒演示就是 50 × 150 = **7500 个样本** —— 对 ACT 来说很充裕。\n\n这也是为啥 LeRobot 几百条演示就够训练，比 ChatGPT 那种几十亿 token 简单太多。'
      },
      {
        id: 'c5-09-failed-episodes',
        type: 'mcq',
        question:
          '你录到第 30 条，杯子滑了掉到桌上 —— 这次任务**失败了**。这条演示该怎么处理？',
        options: [
          { id: 'delete', label: '删掉，重录这一条' },
          { id: 'mark', label: '保留但**标记为失败**' },
          { id: 'fix', label: '保留，但你手动把数据改成成功的' },
          { id: 'all-delete', label: '前面 30 条全删了重来' }
        ],
        correctOptionId: 'mark',
        explanation:
          '## 失败演示**有价值**\n\n保留 + 标记失败：\n\n- 模型能学到「**这种情况下不该这样做**」的负信号\n- 完全删掉会让模型对失败状态没有任何先验\n\n但比例别太高，**< 20% 的失败演示是健康的**，超过 30% 会污染学习目标。\n\nLeRobot 有内建按钮让你按下时标记当前 episode 为失败。'
      },
      {
        id: 'c5-10-push-hub',
        type: 'command',
        title: '（可选）把数据集传到 HuggingFace Hub',
        intro: '想分享给别人，或者备份到云？加一个 `--dataset.push_to_hub=true` 标志：',
        description: '在 record 命令里加一行：',
        code:
          'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \\\n  --dataset.repo_id=your-name/so101-pick-cup \\\n  --dataset.num_episodes=50 --dataset.fps=30 \\\n  --dataset.push_to_hub=true \\\n  --display_data=true',
        tip: '需要先 `huggingface-cli login` 登录。**完全可以不传**，本地训练用本地数据集就行。'
      },
      {
        id: 'c5-11-recap',
        type: 'recap',
        title: '🧠 你已经会:',
        bullets: [
          '🎬 用 **teleoperate** 命令试遥操作',
          '📹 用 **record** 命令真的录数据',
          '🔢 简单任务录 **~50 条**，复杂任务 100-300 条',
          '🎲 **变化** 才能泛化 —— 别录 50 条一模一样的',
          '⚠️ **失败演示也保留**，但比例 < 30%'
        ]
      },
      {
        id: 'c5-12-completion',
        type: 'completion',
        title: '🎉 第 5 课通关',
        body: '你已经能录数据了。这是整个流程**最累但最重要**的一步。\n\n下一课我们打开你刚录的数据集**看一眼里面长啥样**。',
        nextChapterId: 6
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 6 — 数据集结构                                             */
  /* ────────────────────────────────────────────────────────────────── */

  6: {
    chapterId: 6,
    title: '数据集长啥样',
    estimatedMinutes: 7,
    cards: [
      {
        id: 'c6-01-intro',
        type: 'intro',
        emoji: '🗂️',
        title: '你刚录了 50 条演示',
        body: '数据现在在哪？长什么样？\n\n这一课打开看一眼。',
        cta: '看一眼 →'
      },
      {
        id: 'c6-02-where',
        type: 'reveal',
        prompt: '你的演示数据被保存在 ——',
        revealCta: '看路径',
        reveal:
          '## 路径\n\n```\n~/.cache/huggingface/lerobot/<repo-id>/\n```\n\n比如你 `--dataset.repo_id` 写的是 `your-name/so101-pick-cup`，路径就是：\n\n```\n~/.cache/huggingface/lerobot/your-name/so101-pick-cup/\n```\n\n打开这个文件夹 —— 你会看到下面这样的结构 ↓',
        followCta: '看目录树 →'
      },
      {
        id: 'c6-03-tree',
        type: 'viz',
        title: '数据集目录结构',
        mermaid: `flowchart TD
    Root["📁 so100-pick-cup/"] --> Data["📁 data/<br/>(动作 + 状态)"]
    Root --> Meta["📁 meta/<br/>(元信息)"]
    Root --> Videos["📁 videos/<br/>(相机帧)"]
    Data --> Chunk["📁 chunk-000/<br/>📄 episode_000.parquet<br/>📄 episode_001.parquet<br/>..."]
    Meta --> Info["📄 info.json<br/>📄 episodes.jsonl<br/>📄 stats.json"]
    Videos --> CamFolders["📁 observation.images.cam_top/<br/>📁 observation.images.cam_side/"]
    CamFolders --> Mp4["🎥 episode_000.mp4<br/>🎥 episode_001.mp4"]
    style Data fill:#dbeafe,stroke:#3b82f6
    style Meta fill:#fef3c7,stroke:#f59e0b
    style Videos fill:#fce7f3,stroke:#ec4899`,
        caption: '三个核心目录。data 存关节角度（小），videos 存相机帧（大），meta 描述这个数据集是什么。'
      },
      {
        id: 'c6-04-biggest',
        type: 'mcq',
        question: '上面三个目录中，**哪个占的硬盘空间最大**？',
        options: [
          { id: 'data', label: 'data/ — 50 条演示的关节数据' },
          { id: 'meta', label: 'meta/ — 元信息文件' },
          { id: 'videos', label: 'videos/ — 相机录像' }
        ],
        correctOptionId: 'videos',
        explanation:
          '## videos 占 95%+\n\n粗算：\n\n- **data/** 一条 5 秒演示的关节数据 ≈ **6 KB**\n- **meta/** 几个 json 文件总共 ≈ **几 KB**\n- **videos/** 一条 5 秒 480p 30fps 视频 ≈ **2-5 MB**（× 2 个相机 × 50 条 = 几百 MB）\n\n所以你数据集硬盘占用基本等于视频占用。带宽不够时可以降低视频分辨率 / 用 H.265 编码。'
      },
      {
        id: 'c6-05-info-json',
        type: 'reveal',
        prompt: '`meta/info.json` 是整个数据集**最重要的文件**。',
        revealCta: '为什么这么重要',
        reveal:
          '## info.json = 数据集的「身份证」\n\n里面记录了：\n\n- **episodes 总数**\n- **每条 episode 有多少帧**\n- **状态/动作维度**\n- **相机数量、分辨率、帧率**\n- **数据集 schema 版本**\n\n训练时 LeRobot 会先读这个文件 —— **如果它不存在或损坏，训练直接报错**。\n\n```\nFileNotFoundError: meta/info.json\n```\n\n是初学者最常见的报错之一。',
        followCta: '亲眼看一下 →'
      },
      {
        id: 'c6-06-cat-info',
        type: 'command',
        title: '打开 info.json 看一眼',
        description: '直接 cat 出来：',
        code: 'cat ~/.cache/huggingface/lerobot/your-name/so101-pick-cup/meta/info.json',
        expectedOutput:
          '{\n  "codebase_version": "v2.0",\n  "robot_type": "so100",\n  "total_episodes": 50,\n  "total_frames": 7423,\n  "fps": 30,\n  "features": {\n    "observation.state": {"dtype": "float32", "shape": [6]},\n    "action": {"dtype": "float32", "shape": [6]},\n    ...\n  }\n}',
        tip: '看 `total_episodes` 是 50 + `total_frames` 是 ~7500 = 平均每条 150 帧 = 5 秒 30fps。**逻辑闭环**。'
      },
      {
        id: 'c6-07-missing-info',
        type: 'mcq',
        question:
          '你尝试启动训练，但报错：\n\n```\nFileNotFoundError: meta/info.json\n```\n\n最可能的原因是？',
        options: [
          { id: 'corrupt', label: 'info.json 文件损坏，需要修复' },
          { id: 'permission', label: '权限问题，加 sudo' },
          { id: 'incomplete', label: '上次 record 中途被 Ctrl+C 强制终止，没生成 meta' },
          { id: 'wrong-version', label: 'LeRobot 版本不对' }
        ],
        correctOptionId: 'incomplete',
        explanation:
          '## record 必须**完整结束**才会写 meta\n\nLeRobot 的 record 流程：\n\n1. 一边录数据 → 写 episode parquet\n2. 录完所有 episodes 后 → **统一计算并写 meta/info.json**\n\n如果你在第 1 步中途 Ctrl+C 了，data/ 里有部分 parquet，但 meta/ **完全没生成**。训练时找不到 info.json 就崩。\n\n**修复**：要么重新录完整一遍，要么用 LeRobot 工具脚本基于 data/ 反向重建 meta。'
      },
      {
        id: 'c6-08-frames-kb',
        type: 'numeric',
        question:
          '上面 info.json 显示 fps=30、state/action 维度都是 6、dtype 是 float32。\n\n一条 7 秒的演示，**纯关节数据**（state + action）大约多少 KB？',
        answer: 10,
        tolerance: 2,
        unit: 'KB',
        hint: '帧数 × (state维度 + action维度) × 4 字节（float32）',
        explanation:
          '## ✅ 约 10 KB\n\n```\n30 fps × 7 秒 = 210 帧\n每帧 = 6 + 6 = 12 个 float32\n每个 float32 = 4 字节\n\n210 × 12 × 4 = 10,080 字节 ≈ 10 KB\n```\n\n50 条这样的演示 = **~500 KB 的关节数据**。\n\n对比同样 50 条演示的视频帧 ≈ **几百 MB**。这就是为啥说「真正占空间的是视频」。'
      },
      {
        id: 'c6-09-recap',
        type: 'recap',
        title: '🧠 你已经知道:',
        bullets: [
          '📁 数据存在 `~/.cache/huggingface/lerobot/<repo-id>/`',
          '🗂️ 三大目录：**data**（关节）、**meta**（元信息）、**videos**（相机）',
          '📄 **info.json** 是整个数据集的身份证 —— 必须完整',
          '💾 视频占 95%+ 的空间，关节数据每秒只占几 KB',
          '⚠️ record 中途 Ctrl+C 会导致 meta 缺失 —— **必须录完**'
        ]
      },
      {
        id: 'c6-10-completion',
        type: 'completion',
        title: '🎉 第 6 课通关',
        body: '数据有了，结构清楚了。\n\n下一课**进入正题** —— 让神经网络真的学。',
        nextChapterId: 7
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 7 — ACT 模型训练                                           */
  /* ────────────────────────────────────────────────────────────────── */

  7: {
    chapterId: 7,
    title: '训练 ACT 模型',
    estimatedMinutes: 12,
    cards: [
      {
        id: 'c7-01-intro',
        type: 'intro',
        emoji: '🧠',
        title: '终于到 AI 部分了',
        body: '数据有了 50 条 7500 帧。\n\n该让神经网络上场了。',
        cta: '走起 →'
      },
      {
        id: 'c7-02-act-pieces',
        type: 'reveal',
        prompt: 'ACT (Action Chunking Transformer) **不是一个东西**。',
        revealCta: '到底是啥',
        reveal:
          '## ACT = 三个组件组合\n\n1. **Transformer Encoder** —— 看当前的图像 + 关节状态，提取「我现在处于什么情况」的特征\n2. **CVAE (条件变分自编码器)** —— 处理「同一情况下人可能给出多种合理动作」的多模态问题\n3. **Transformer Decoder** —— 一次输出**未来 100 步**的动作（这就是「Action Chunking」）\n\n第 3 个是关键。BC 一次出一步动作 → 复合误差累积。\n\nACT 一次出 100 步动作 → **段内自洽**，复合误差被压住。',
        followCta: '看架构图 →'
      },
      {
        id: 'c7-03-arch-viz',
        type: 'viz',
        title: 'ACT 架构图',
        mermaid: `flowchart LR
    Img["📷 当前相机帧"] --> Enc["Transformer<br/>Encoder"]
    State["📐 当前关节状态"] --> Enc
    Enc --> CVAE["CVAE<br/>(latent z)"]
    CVAE --> Dec["Transformer<br/>Decoder"]
    Dec --> Out["📦 未来 100 步<br/>动作序列"]
    style Enc fill:#7c5cff,stroke:#7c5cff,color:#fff
    style CVAE fill:#f59e0b,stroke:#f59e0b,color:#fff
    style Dec fill:#22c55e,stroke:#22c55e,color:#fff
    style Out fill:#0ea5e9,stroke:#0ea5e9,color:#fff`,
        caption: '图像 + 关节状态 → Encoder 提特征 → CVAE 注入多模态 → Decoder 一口气输出 100 步动作。'
      },
      {
        id: 'c7-04-which-component',
        type: 'choice',
        question: '上面三个组件中，**哪个让 ACT 比 BC 强**？',
        options: [
          {
            id: 'cvae',
            label: 'A. CVAE —— 它能处理「同一情况多种合理动作」',
            feedback:
              '对，但只对了一半。CVAE 解决的是**多模态分布**问题（人对同一情况可能有 3 种合理操作方式）—— 但这不是 BC 的主要问题。\n\n看 C 选项 →'
          },
          {
            id: 'chunking',
            label: 'B. Action Chunking —— 一次预测一段动作，治复合误差',
            feedback:
              '对，但只对了一半。这确实是核心创新，治了 BC 的雪球累积。\n\n但论文实测显示 **CVAE 也贡献了 20-30% 效果**。看 C 选项 →'
          },
          {
            id: 'both',
            label: 'C. 两个都重要 —— Chunking 治复合误差、CVAE 处理多模态',
            feedback:
              '✨ **完整答案**。\n\nACT 论文做了消融实验：\n- 只去掉 Chunking → 性能掉 50%+（最关键）\n- 只去掉 CVAE → 性能掉 20-30%\n\n两个组合起来才有 ACT 的高表现。Transformer 本身只是 backbone，不是创新点。',
            correct: true
          }
        ]
      },
      {
        id: 'c7-05-start-training',
        type: 'command',
        title: '启动训练',
        description: '一条命令搞定（前提：第 5 课的数据集已录好）：',
        code:
          'lerobot-train \\\n  --dataset.repo_id=your-name/so101-pick-cup \\\n  --policy.type=act \\\n  --output_dir=outputs/train/act_so101',
        expectedOutput:
          '[INFO] Loading dataset...\n[INFO] Building ACT model (params: 84.5M)...\n[INFO] Starting training...\nstep 0    loss 1.247    lr 1e-4\nstep 100  loss 0.456    lr 1e-4\nstep 500  loss 0.182    lr 1e-4\n...',
        tip: '默认会跑 200,000 步。在 RTX 3060 上大约 6-8 小时，CPU 上 1-2 天。\n\n**可以中途 Ctrl+C** —— checkpoint 会自动保存，下次加 `resume=true` 接着训练。'
      },
      {
        id: 'c7-06-batch-size',
        type: 'mcq',
        question:
          '默认 batch_size 是 8。你 GPU 显存 12 GB —— **要不要调大**？',
        options: [
          { id: 'no', label: '不调，默认就最好' },
          { id: 'try-bigger', label: '可以试 16 或 32，显存够就用，加速训练' },
          { id: 'max', label: '调到 256 一把梭' },
          { id: 'smaller', label: '调到 4，更稳' }
        ],
        correctOptionId: 'try-bigger',
        explanation:
          '## batch_size 越大越好（在显存允许内）\n\n- batch 越大 → 每步用更多样本计算梯度 → **梯度估计更准** → 收敛快\n- 但 batch 越大 → 占显存越多 → 容易 OOM\n\n**策略**：从 16 试起，看显存使用率（`nvidia-smi`）。如果还有富余就上 32。OOM 了就退回。\n\n12 GB 显存对 ACT 一般能塞 batch_size=32-64。'
      },
      {
        id: 'c7-07-loss-curve',
        type: 'reveal',
        prompt: '训练时 loss 应该怎么变？',
        revealCta: '健康的曲线长啥样',
        reveal:
          '## 健康的 loss 曲线 📉\n\n```\nstep 0     loss 1.5\nstep 1k    loss 0.4    ← 前 1000 步快速下降\nstep 10k   loss 0.15\nstep 50k   loss 0.08   ← 越来越慢\nstep 100k  loss 0.06\nstep 200k  loss 0.055  ← 收敛了\n```\n\n**关键信号**：\n\n- 前 1k 步 loss 急速下降 → ✅ 模型开始学了\n- 中段稳步下降 → ✅ 正常\n- 后期变化 < 5% → ✅ 收敛，可以停了\n\n**不健康信号**：\n- loss 突然变 NaN → 梯度爆炸\n- loss 反弹上升 → 学习率太大\n- loss 卡在初始值不降 → 数据有问题',
        followCta: 'NaN 怎么救？ →'
      },
      {
        id: 'c7-08-nan-loss',
        type: 'choice',
        question: 'loss 变 NaN 了。怎么救？',
        options: [
          {
            id: 'restart',
            label: 'A. 重启 Python 进程',
            feedback: '没用 —— NaN 来自模型的数学计算，重启只会重新走到同一个坑。\n\n看 C 选项 →'
          },
          {
            id: 'more-epochs',
            label: 'B. 多训几个 epoch，等它自己恢复',
            feedback: 'NaN 是**不可逆**的 —— 一旦梯度变 NaN，整个网络的权重都被污染，后面只会更糟。\n\n看 C 选项 →'
          },
          {
            id: 'lower-lr-clip',
            label: 'C. 学习率降一个量级 + 启用梯度裁剪',
            feedback:
              '✨ **正确**。\n\nNaN 几乎总是「梯度爆炸」的结果 —— 学习率太大让权重一步跳到天上，下次计算就溢出。\n\n应急两板斧：\n```\n--optimizer.lr=1e-5  (从 1e-4 降到 1e-5)\n--optimizer.grad_clip_norm=10  (梯度裁剪)\n```\n\n90% 情况下这两个一起够了。',
            correct: true
          }
        ]
      },
      {
        id: 'c7-09-wandb',
        type: 'command',
        title: '加监控：wandb',
        intro: '看 loss 不能光看终端。**wandb** 是机器学习的标配监控面板，会画 loss 曲线、记录超参、对比多次实验。',
        description: '装好后只要加两个参数：',
        code:
          'wandb login   # 第一次要登一下\n\nlerobot-train \\\n  --dataset.repo_id=... --policy.type=act \\\n  dataset.repo_id=your-name/so101-pick-cup \\\n  wandb.enable=true \\\n  wandb.project=so101-experiments',
        tip: '训练开始后 wandb 会打印一个 URL，浏览器打开能实时看 loss 曲线。\n\n免费版功能完全够个人用。'
      },
      {
        id: 'c7-10-steps-per-epoch',
        type: 'numeric',
        question:
          '你有 50 条演示，每条平均 150 帧 = **7500 个样本**。\n\nbatch_size = 8，**一个 epoch 大概要多少 step**？',
        answer: 938,
        tolerance: 10,
        unit: 'step',
        hint: '总样本数 ÷ batch_size = 一个 epoch 的 step 数（向上取整）',
        explanation:
          '## ✅ 约 938 step\n\n```\n7500 ÷ 8 = 937.5 → 938 step\n```\n\n训练 200k step ≈ **213 个 epoch**。每个样本被模型见过 213 次 —— 充分了。\n\n这也是为啥简单任务 50 条演示就够：单条演示**被复用很多次**。'
      },
      {
        id: 'c7-11-recap',
        type: 'recap',
        title: '🧠 这一关你已经掌握:',
        bullets: [
          '🧠 **ACT** = Transformer Encoder + CVAE + Decoder（输出 100 步）',
          '🎯 让 ACT 强的核心：**Action Chunking** + **CVAE**',
          '🚀 `--dataset.repo_id=... --policy.type=act` 启动训练',
          '📉 loss 健康 = 前 1k 快速降 → 后期 < 5% 变化收敛',
          '⚠️ **NaN loss** ➜ 学习率 ÷ 10 + 梯度裁剪',
          '📊 用 **wandb** 监控，比看终端高效得多'
        ]
      },
      {
        id: 'c7-12-completion',
        type: 'completion',
        title: '🎉 第 7 课通关',
        body: '你已经能训练出一个 ACT 模型了。\n\n下一课：**把训练好的模型，真的让机器人动起来**。',
        nextChapterId: 8
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 8 — 推理与实机部署                                         */
  /* ────────────────────────────────────────────────────────────────── */

  8: {
    chapterId: 8,
    title: '推理 + 实机部署',
    estimatedMinutes: 10,
    cards: [
      {
        id: 'c8-01-intro',
        type: 'intro',
        emoji: '🦾',
        title: '训练完了',
        body: '你硬盘上躺着一个 checkpoint 文件，几百 MB。\n\n现在 —— **怎么让它真的让机器人动起来**？',
        cta: '走起 →'
      },
      {
        id: 'c8-02-inference-cmd',
        type: 'command',
        title: '让训练好的模型上岗',
        intro: '推理命令长这样：',
        description: '同样用 `lerobot-record`，但这次加 `--policy.path`：',
        code:
          'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --dataset.repo_id=your-name/so101-eval \\\n  --dataset.num_episodes=5 --dataset.fps=30 \\\n  --policy.path=outputs/train/act_so101/checkpoints/last/pretrained_model \\\n  --display_data=true',
        expectedOutput:
          '[INFO] Loading policy from checkpoints/last/...\n[INFO] Robot ready. Press Enter to start inference episode 1/5.',
        tip: '注意 `--policy.path` 指向**训练输出目录里的 last/pretrained_model**。`last` 是最近的检查点。想用某个具体步数的 checkpoint 就改成 `step_50000/` 之类。\n\n按 Enter 后 Follower 臂会**自己开始动**。Leader 不动了 —— 它已经退休。'
      },
      {
        id: 'c8-03-first-run',
        type: 'mcq',
        question: '第一次推理，机器人完美完成任务的概率有多大？',
        options: [
          { id: 'high', label: '90%+ —— 训练 loss 都收敛了' },
          { id: 'low', label: '5-30% —— 模拟到现实的 sim2real gap 永远在' },
          { id: 'zero', label: '0% —— 必须再训 100 万 step' }
        ],
        correctOptionId: 'low',
        explanation:
          '## 第一次成功率往往很低\n\n训练 loss 低 ≠ 实测高。原因：\n\n1. **训练数据有限**：你录了 50 条，覆盖不了所有真实情况\n2. **环境扰动**：光线、相机噪声、机械臂电机微抖动\n3. **复合误差仍在**：即使 ACT 治了一部分，长任务还是会偏\n\n**第一次 10-30% 成功率很正常**。先调几个参数再看。下一卡讲怎么调。'
      },
      {
        id: 'c8-04-compounding-back',
        type: 'reveal',
        prompt: '记得第 1 课讲的**复合误差**吗？',
        revealCta: '回顾',
        reveal:
          '## 复合误差又来了 🌨️\n\n虽然 ACT 用 Action Chunking 大大减轻了它，但**没完全消除**。\n\n你会观察到的现象：\n\n- **前 2-3 秒**：动作很顺，几乎跟训练演示一样\n- **中段**：开始稍微偏\n- **后段**：偏到完全错的姿态\n\n这就是**短段内 ACT 自洽**，但**段与段之间**还是会累积。\n\n下面两个工具能进一步压住它：**EMA 平滑** + **Temporal Ensembling**。',
        followCta: '看一下解决方案 →'
      },
      {
        id: 'c8-05-pipeline-viz',
        type: 'viz',
        title: '推理时数据流',
        mermaid: `flowchart LR
    Cam["📷 相机"] --> Pre["预处理<br/>归一化"]
    State["📐 关节状态"] --> Pre
    Pre --> Policy["🧠 ACT 策略"]
    Policy --> Chunk["📦 100 步动作"]
    Chunk --> Smooth["✨ EMA / TE<br/>平滑"]
    Smooth --> Motor["🦾 Follower<br/>电机指令"]
    Motor -.->|"30 fps 循环"| Cam
    style Policy fill:#22c55e,stroke:#22c55e,color:#fff
    style Smooth fill:#f59e0b,stroke:#f59e0b,color:#fff`,
        caption: '相机+状态 → 预处理 → ACT 出 100 步 → 平滑 → 电机执行 → 新一帧。30 fps 不停转。EMA / Temporal Ensembling 是关键的「最后一道保险」。'
      },
      {
        id: 'c8-06-fps-control',
        type: 'command',
        title: '把推理 fps 锁死',
        intro: 'LeRobot 默认会尽全力跑，但**不稳定的 fps 是抖动的元凶**。把它锁在 30：',
        description: '加 `--dataset.fps 30`：',
        code:
          'lerobot-record \\\n  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \\\n  --dataset.repo_id=your-name/so101-eval \\\n  --dataset.num_episodes=5 --dataset.fps=30 \\\n  --policy.path=outputs/.../pretrained_model \\\n  --display_data=true',
        tip: '为啥锁 30？因为**训练数据就是 30 fps 录的**。推理时 fps 跟训练 fps 一致才能让模型「感觉」一致。差太多 → 模型懵。',
        warning: '如果你 GPU 不够强，**实际跑不到 30 fps**（每帧推理 > 33ms），LeRobot 会丢帧，依然不稳。这时候要么换更快的 GPU，要么训练时也用更低的 fps。'
      },
      {
        id: 'c8-07-ema-define',
        type: 'reveal',
        prompt: '听说过 EMA 平滑吗？',
        revealCta: '看定义',
        reveal:
          '## EMA = Exponential Moving Average\n\n中文「指数移动平均」。一行公式：\n\n```\nsmoothed_action = α × current_action + (1 - α) × previous_action\n```\n\n`α` 一般取 **0.3** —— 意思是「新动作只占 30%，旧动作占 70%」。\n\n**效果**：突然的抖动被旧动作「拽住」，不会立刻反映到电机上。机械臂动起来明显**更顺**。\n\n代价：响应慢了一点（对快速任务可能影响精度），但绝大多数任务可以接受。',
        followCta: '看代码 →'
      },
      {
        id: 'c8-08-ema-code',
        type: 'command',
        title: 'EMA 平滑的代码片段',
        intro: '其实就是一行：',
        description: '在你的推理循环里：',
        code:
          'prev_action = None\nalpha = 0.3   # 平滑系数，0=完全用旧动作, 1=完全用新动作\n\nfor obs in robot_loop():\n    action = policy(obs)\n    if prev_action is not None:\n        action = alpha * action + (1 - alpha) * prev_action\n    robot.send_action(action)\n    prev_action = action',
        language: 'python',
        tip: '`α` 是个旋钮：\n- α = 0.5 → 中等平滑\n- α = 0.3 → 强平滑（默认推荐）\n- α = 0.1 → 极强平滑（响应慢，可能跟不上快速任务）'
      },
      {
        id: 'c8-09-still-shaky',
        type: 'mcq',
        question: '加了 EMA 还是抖。还能怎么办？',
        options: [
          { id: 'higher-alpha', label: 'α 调到 0.05（更狠的平滑）' },
          { id: 'tempo-ensemble', label: '用 Temporal Ensembling（多个 chunk 的预测加权平均）' },
          { id: 'lower-fps', label: 'fps 降到 15' },
          { id: 'all-of-above', label: '上面三个组合一起试' }
        ],
        correctOptionId: 'all-of-above',
        explanation:
          '## 抖动调参组合拳\n\n这是个**调参问题**，没有银弹。一般顺序：\n\n1. **fps 锁稳定**（最关键，先解决系统性抖）\n2. **EMA α 调小**（0.3 → 0.2 → 0.1）\n3. **Temporal Ensembling**（ACT 论文推荐的高级方案，把每帧从过去几个 chunk 的预测加权平均）\n4. **检查 USB 接线**（信号不稳也表现为抖）\n5. **录更多训练数据**（极端情况下的根因）\n\n90% 调到 step 3 都能解决。'
      },
      {
        id: 'c8-10-recap',
        type: 'recap',
        title: '🧠 这一关你已经掌握:',
        bullets: [
          '🦾 用 `--policy.path` 加载 checkpoint 上岗',
          '⚠️ **第一次成功率 10-30% 是正常的**，别灰心',
          '🌨️ **复合误差**仍在，但比 BC 好太多',
          '🔒 `--dataset.fps 30` 锁死帧率 = 抖动调优第一步',
          '✨ **EMA 平滑**：α=0.3，一行代码搞定大半抖动',
          '🎯 还抖 ➜ Temporal Ensembling / 更多数据'
        ]
      },
      {
        id: 'c8-11-completion',
        type: 'completion',
        title: '🎉 第 8 课通关',
        body:
          '从数据 → 模型 → 实机，**全流程你都走完了**。\n\n最后一课：教你**怎么应对一切意外** —— 因为意外是必然的。',
        nextChapterId: 9
      }
    ]
  },

  /* ────────────────────────────────────────────────────────────────── */
  /* Chapter 9 — 调试 / 排错心法                                        */
  /* ────────────────────────────────────────────────────────────────── */

  9: {
    chapterId: 9,
    title: '出错了别慌',
    estimatedMinutes: 7,
    cards: [
      {
        id: 'c9-01-intro',
        type: 'intro',
        emoji: '🐛',
        title: '你一定会遇到错',
        body: '别慌。所有人都会。\n\n这一课教你**怎么有系统地解决任何报错** —— 这是工程师真正值钱的能力。',
        cta: '走起 →'
      },
      {
        id: 'c9-02-four-steps',
        type: 'reveal',
        prompt: '90% 的报错可以用同一个 4 步法解决 ——',
        revealCta: '看 4 步',
        reveal:
          '## 通用 4 步排错法\n\n1. **认真读最后一行报错** —— 不是滚到最上面，是看最后一句话\n2. **判断错误类型** —— 环境？硬件？数据？训练？推理？\n3. **去站内「报错诊断」搜关键字** —— 已经收录的几十条覆盖 80% 常见错\n4. **谷歌精确报错** —— 用引号搜：`"具体错误关键字"`\n\n90% 在第 3 步就解决了。剩下 10% Google 第一页一定能找到。',
        followCta: '看决策树 →'
      },
      {
        id: 'c9-03-flow-viz',
        type: 'viz',
        title: '排错决策树',
        mermaid: `flowchart TD
    Err["💥 报错!"] --> Read["1. 读最后一行"]
    Read --> Type{"2. 判断类型"}
    Type -->|"env / install"| Q1["pip install / conda activate?"]
    Type -->|"hardware / port"| Q2["dialout 组? ttyUSB 存在?"]
    Type -->|"data / file"| Q3["meta/info.json 在?"]
    Type -->|"training"| Q4["batch_size? lr? NaN?"]
    Q1 --> KB["3. 站内诊断库"]
    Q2 --> KB
    Q3 --> KB
    Q4 --> KB
    KB --> Found{"找到?"}
    Found -->|"是"| Fix["✅ 修"]
    Found -->|"否"| Google["4. Google 精确报错"]
    Google --> Fix
    style Err fill:#dc2626,color:#fff
    style Fix fill:#16a34a,color:#fff`,
        caption: '决策树。每个分支对应一类典型错误。'
      },
      {
        id: 'c9-04-which-line',
        type: 'choice',
        question: '终端打印了一长串 traceback（错误栈），有 30 行。**先看哪行**？',
        options: [
          {
            id: 'first',
            label: 'A. 第一行 —— 那是最原始的错误',
            feedback: '其实**最后一行**才是直接告诉你「啥错了」的总结。\n\n看 B 选项 →'
          },
          {
            id: 'last',
            label: 'B. 最后一行 —— 直接的错误总结',
            feedback:
              '✨ **对**。\n\nPython traceback 的结构：\n- 前面 N 行是「调用链」（从顶层一路下钻到出错的地方）\n- **最后一行**是错误类名 + 错误信息 → 这是你最该看的\n\n第二关键的是**离最后一行最近的「写有你自己代码路径」那一行** —— 那是你能直接改的地方。',
            correct: true
          },
          {
            id: 'middle',
            label: 'C. 中间 —— 那是最相关的部分',
            feedback: '中间一般是库的内部调用，对调试帮助不大。\n\n看 B 选项 →'
          }
        ]
      },
      {
        id: 'c9-05-error-types',
        type: 'match',
        prompt: '把三类常见错误配上「一般原因」：',
        pairs: [
          { left: 'ImportError', right: '缺包 / 环境没激活' },
          { left: 'RuntimeError (CUDA OOM)', right: '显存不够，batch 太大' },
          { left: 'FileNotFoundError', right: '路径写错 / 数据集没录完整' }
        ]
      },
      {
        id: 'c9-06-save-error',
        type: 'command',
        title: '把错误完整保存',
        intro: '出错时先**完整保存输出**，免得后面看不到。这条命令把所有输出（包括错误）都存到 `error.log`：',
        description: '在你的训练/推理命令后面加：',
        code: 'lerobot-train --dataset.repo_id=your-name/so101-pick-cup --policy.type=act ... 2>&1 | tee error.log',
        expectedOutput: '(同时显示在屏幕上 + 写入 error.log)',
        tip: '`2>&1` 把错误流也合到正常输出。\n`| tee` 同时显示在屏幕**和**写文件。\n\n以后求助别人时，附上 error.log 比截图清楚 10 倍。'
      },
      {
        id: 'c9-07-good-question',
        type: 'mcq',
        question: '你被一个错卡住了，决定去问 AI 助手 / Discord 社区。**怎么提问最有效**？',
        options: [
          { id: 'help', label: '「帮帮我，我训练 ACT 报错了！」' },
          {
            id: 'verbose',
            label:
              '附完整错误栈 + 你的命令 + 数据集 info.json + 已经尝试过的方案'
          },
          { id: 'screenshot', label: '截一张终端截图发过去' },
          { id: 'rephrase', label: '把错误内容换成自己的话描述一下' }
        ],
        correctOptionId: 'verbose',
        explanation:
          '## 信息量决定回答质量\n\n好的提问模板：\n\n```\n我在做 X (LeRobot ACT 训练 SO100)，\n报错: <完整错误栈>\n命令: <你跑的命令>\n配置: <yaml 文件 / info.json 关键部分>\n已尝试: <你做过哪些尝试，结果是什么>\n```\n\n90% 的 Discord/forum 高质量回复都是因为问题问得清楚。\n\n**截图** ✗ 别人没法复制错误关键字去搜。\n**「帮帮我」** ✗ 信息量为零。\n**重新描述错误** ✗ 你描述的可能丢了关键字。'
      },
      {
        id: 'c9-08-ask-ai-here',
        type: 'reveal',
        prompt: '本站就内置了一个 AI 助手。它有什么特别？',
        revealCta: '说说',
        reveal:
          '## 本站 AI 助手 🤖\n\n- **全站知识库索引**：9 章内容 + 13 条错误库 + 16 个术语表都喂给它了\n- **中英混合分词 + 同义词扩展**：「校准」和 "calibration" 都能命中\n- **意图识别**：自动判断你是问概念 / 报错 / 命令 / 比较\n- **来源引用**：每个回答都附章节链接，方便你深入\n\n用法很简单：[去 AI 助手](/assistant)。\n\n比 Discord 等回复快，比 Google 上下文更对口（它知道你是用 SO101 + LeRobot）。',
        followCta: '继续 →'
      },
      {
        id: 'c9-09-recap',
        type: 'recap',
        title: '🧠 排错心法你已经掌握:',
        bullets: [
          '🔍 **4 步法**：读最后一行 → 判断类型 → 站内库 → Google',
          '👀 traceback **看最后一行**，不是第一行',
          '📋 三大错误类型：**ImportError / RuntimeError / FileNotFoundError**',
          '💾 `2>&1 | tee error.log` 完整保存错误',
          '🙋 提问要附 **错误栈 + 命令 + 已尝试**，别只发截图',
          '🤖 本站 [AI 助手](/assistant) 是首选求助渠道'
        ]
      },
      {
        id: 'c9-10-completion',
        type: 'completion',
        title: '🎉 全部 9 课通关！',
        body:
          '你已经走完了 SO101 模仿学习的**全部主线** ——\n\n从「什么是模仿学习」到硬件、环境、数据、训练、推理、排错。\n\n你现在拥有的，是 2025 年大部分机器人学硕士新生的入门水平。\n\n**接下来怎么走？**\n\n- 真的买一台 SO101 把这套流程跑一遍\n- 尝试做一个属于你自己的小任务（折毛巾？倒水？开盒？）\n- 读 ACT 原论文，理解每个超参背后的数学\n- 加入 LeRobot Discord，和全世界做这件事的人交流\n\n感谢你坚持到了这里。 🚀'
      }
    ]
  }
}

/**
 * Returns the lesson for a chapter id, or null if no interactive lesson is
 * authored yet. Page should fall back to the article view in that case.
 */
export function getLesson(chapterId: number): Lesson | null {
  return lessons[chapterId] ?? null
}

/**
 * Chapter ids that have a play-mode lesson available. Used by the chapter
 * cards on /learn to decide whether to show the "互动课" CTA.
 */
export function hasLesson(chapterId: number): boolean {
  return chapterId in lessons
}
