# ============================================================================
# 中国版(cn region)容器镜像 —— 部署到香港 / 国内 Node 节点。
# 国际版仍走 Vercel,不用这个文件。
#
# 构建（CloudBase 配置由 build args 传入，都是前端公开 key，非密钥）：
#   docker build -t lvjin-cn \
#     --build-arg NEXT_PUBLIC_CLOUDBASE_ENV=lvjin-d7g6dmac8ef71a099 \
#     --build-arg NEXT_PUBLIC_CLOUDBASE_REGION=ap-shanghai \
#     --build-arg NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY=<publishable key> .
#   docker run -p 3000:3000 lvjin-cn
# ============================================================================

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# ── deps：按 lockfile 装全部依赖（含构建期需要的 devDeps）──────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── builder：带 cn region + CloudBase 配置构建 ──────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_CLOUDBASE_ENV
ARG NEXT_PUBLIC_CLOUDBASE_REGION
ARG NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY
ENV NEXT_PUBLIC_REGION=cn \
    NEXT_PUBLIC_CLOUDBASE_ENV=$NEXT_PUBLIC_CLOUDBASE_ENV \
    NEXT_PUBLIC_CLOUDBASE_REGION=$NEXT_PUBLIC_CLOUDBASE_REGION \
    NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY=$NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ── runner：只带 standalone 产物，最小镜像 ──────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
