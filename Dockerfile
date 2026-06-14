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

ARG NEXT_PUBLIC_CLOUDBASE_ENV=lvjin-d7g6dmac8ef71a099
ARG NEXT_PUBLIC_CLOUDBASE_REGION=ap-shanghai
ARG NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY=eyJhbGciOiJSUzI1NiIsImtpZCI6IjNjNGRkOGZmLTZmNjgtNDU3OC1iYWY3LTZlYWQ3MGZmOGM0MSJ9.eyJpc3MiOiJodHRwczovL2x2amluLWQ3ZzZkbWFjOGVmNzFhMDk5LmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJsdmppbi1kN2c2ZG1hYzhlZjcxYTA5OSIsImV4cCI6NDA4NDk2MjUyMCwiaWF0IjoxNzgxMjc5MzIwLCJub25jZSI6InF5UjZ1NE8zVG5pV1VFbVdEcGhTVlEiLCJhdF9oYXNoIjoicXlSNnU0TzNUbmlXVUVtV0RwaFNWUSIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJsdmppbi1kN2c2ZG1hYzhlZjcxYTA5OSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJyb2xlIjoiYW5vbiIsImlzX2Fub255bW91cyI6dHJ1ZSwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiYW5vbnltb3VzIiwicHJvdmlkZXJzIjpbImFub255bW91cyJdfSwidXNlcl9tZXRhZGF0YSI6eyJuYW1lIjoiQW5vbnltb3VzIn0sInVzZXJfdHlwZSI6IiIsImNsaWVudF90eXBlIjoiY2xpZW50X3VzZXIiLCJpc19zeXN0ZW1fYWRtaW4iOmZhbHNlfQ.ZsnnPIkF1TTNvFtcES5VIcSUU2-bQRJogXg8jrDXMBnwRRib3XGKR-xUL1nfSrjeBPU2TW3ADLtrxNool-tB69zwvEzvhRpIyASE5xCJpm0x9DuH7Ale-0QarGlHYych5R3cW-kldSEPPfSfwZXIz7UIWPpXGuJyGWcto2CFxxZRyPeHmYPqtJAzF1wveMgU5GRf8AIt5RGyFbtOyo_E40UDfhAw3ipscdA92pLdyA7hL2YseLV1dAKRrqgil1bRkn0NdteCmW1-VfWkWiClGHnoUV5nTX3r7esr8namc2PHtaNn_TDjaY24LzZzpZTUtiAL1LzUiBEShmlU-4Mztw
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
