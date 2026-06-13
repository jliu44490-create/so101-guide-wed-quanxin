# 中国版部署指南（cn.lvjin.online）

中国版 = **同一套代码**,用 `NEXT_PUBLIC_REGION=cn` 构建后部署到**香港 / 国内 Node 节点**。
国际版仍在 Vercel,互不影响。

---

## 一、构建产物

CN 版是 **Node 应用**(`next start` / standalone),不是纯静态(站点有 API 路由和动态页)。
已配 `output: 'standalone'` + `Dockerfile`,可直接出容器镜像。

CloudBase 这几个值在**构建时**注入(都是前端公开 key,非密钥):

| 变量 | 值 |
|---|---|
| `NEXT_PUBLIC_REGION` | `cn`(Dockerfile 已写死) |
| `NEXT_PUBLIC_CLOUDBASE_ENV` | `lvjin-d7g6dmac8ef71a099` |
| `NEXT_PUBLIC_CLOUDBASE_REGION` | `ap-shanghai` |
| `NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY` | 控制台的 Publishable Key(匿名访问令牌) |

```bash
docker build -t lvjin-cn \
  --build-arg NEXT_PUBLIC_CLOUDBASE_ENV=lvjin-d7g6dmac8ef71a099 \
  --build-arg NEXT_PUBLIC_CLOUDBASE_REGION=ap-shanghai \
  --build-arg NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY='<粘贴 Publishable Key>' .

docker run -p 3000:3000 lvjin-cn   # 本地验证：http://localhost:3000
```

> 国内构建网络慢的话,在 builder 阶段加国内 npm 镜像:`pnpm config set registry https://registry.npmmirror.com`(或构建机上预置 `.npmrc`)。

---

## 二、托管选型(免备案过渡阶段)

要 **Node 运行时 + 香港/就近节点 + 免备案**。几个对大陆友好的:

- **VPS 自管**:腾讯云轻量(香港)/ 阿里云(香港)→ Docker 跑镜像 + Caddy/Nginx 反代上 HTTPS。最可控。
- **容器平台**:Zeabur(亚洲节点,对大陆友好)、Sealos、Fly.io(选 `hkg` 香港 region)→ 直接吃 Dockerfile,自动 HTTPS。最省事。

> ⚠️ 免备案阶段**前端节点放香港**;公司主体到位后再迁国内云 + 备案 + 换 `lvjin.cn`(见长期记忆里的分阶段计划)。

---

## 三、域名 + HTTPS

1. DNS:`cn.lvjin.online` 一条 **A/CNAME** 记录指向香港节点(VPS 填 IP;平台填它给的域名)。
2. HTTPS:平台一般自动签;VPS 用 Caddy(自动 Let's Encrypt)最省事。

---

## 四、CloudBase 控制台:放行生产域名(重要)

本地 `localhost` 默认被 CloudBase 放行,所以开发时认证能用。**生产域名要手动加白名单**,否则线上 SDK 调用会被拦:

- CloudBase 控制台 → **身份认证 / 环境 → 安全配置 / Web 安全域名** → 把 **`cn.lvjin.online`** 加进**允许的来源 / 域名白名单**。

---

## 五、上线后自查

- [ ] `https://cn.lvjin.online` 打开正常、HTTPS 绿锁
- [ ] `/login` 只有邮箱密码(无 GitHub/Google)= CN 变体生效
- [ ] 真机大陆网络实测注册→收 OTP→登录(验证域名白名单已生效)
- [ ] 社区区块显示"即将开放"占位(数据层下一阶段走云函数,见 `cloudbase/schema.sql` + 长期记忆)

---

## 待办(下一阶段)

- **社区评论**:CloudBase 这个套餐的「数据模型」服务不可达 + 浏览器直连 REST 被 CORS 拦,需走**云函数**(Node + `pg` 连 PG,`app.callFunction` 调用)。表已建(`cloudbase/schema.sql`),抽象层已就位(`lib/backend/cloudbase-community.ts` 待填)。
- 备案 → 国内云 → `lvjin.cn`。
