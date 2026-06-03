/**
 * Site origin used for canonical URLs, sitemap, robots, OG metadata.
 *
 * Resolution order (first non-empty wins):
 *   1. NEXT_PUBLIC_SITE_URL          — explicit override (set this in Vercel for prod custom domain)
 *   2. https://${VERCEL_URL}         — auto-injected by Vercel on every deploy / preview
 *   3. https://lvjin.vercel.app      — fallback for local dev or build without env vars
 *
 * Never trailing-slash. Sitemap/robots build URLs by appending `/path`.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
  'https://lvjin.vercel.app'

export const siteConfig = {
  name: 'SO101 Imitation Learning Guide',
  shortName: 'SO101 Guide',
  brand: '绿晋科技',
  brandEn: 'LVJIN ROBOTICS',
  url: SITE_URL,
  description:
    '从环境配置到 ACT 模型部署的具身智能实战学习平台 —— 帮助开发者、研究者与爱好者快速掌握 SO101 机械臂的模仿学习全流程。',
  keywords: [
    'SO101',
    'SO100',
    '机械臂',
    '工业机械臂',
    '模仿学习',
    'Imitation Learning',
    'LeRobot',
    'ACT',
    'Action Chunking Transformer',
    '具身智能',
    'Embodied AI',
    'HuggingFace',
    '机器人学习',
    'LVJIN ROBOTICS',
    '绿晋科技'
  ],
  authors: [{ name: '绿晋科技', url: SITE_URL }],
  creator: '绿晋科技',
  links: {
    lerobot: 'https://github.com/huggingface/lerobot',
    huggingface: 'https://huggingface.co/lerobot',
    so101: 'https://github.com/TheRobotStudio/SO-ARM100',
    inquiry: "https://mail.google.com/mail/?view=cm&fs=1&to=jliu44490@gmail.com&su=SO101%20学习平台%20联系",
  },
  nav: [
    { href: '/', label: '首页' },
    { href: '/learn', label: '学习路径' },
    { href: '/community', label: '社区' },
    { href: '/diagnose', label: '诊断' },
    { href: '/assistant', label: 'AI 助手' }
  ],
  navExtra: [
    { href: '/glossary', label: '术语表' },
    { href: '/resources', label: '资源中心' },
    { href: '/about', label: '关于' }
  ]
}

export type SiteConfig = typeof siteConfig
