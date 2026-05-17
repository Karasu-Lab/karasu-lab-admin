FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@latest
COPY . .
RUN turbo prune @karasu-lab/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @karasu-lab/api run build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/configs ./configs
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

RUN pnpm install --prod --frozen-lockfile

USER nestjs
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/main"]
