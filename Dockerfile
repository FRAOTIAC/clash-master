# Clash Master - Optimized Multi-stage Docker Build
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Stage 2: Builder
FROM base AS builder
RUN apk add --no-cache libc6-compat python3 make g++ gcc
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/collector/package.json ./apps/collector/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (using hoisted for stability)
RUN echo "node-linker=hoisted" > .npmrc
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# Create a minimal, deployable bundle for collector (production deps only)
RUN pnpm --filter @clashmaster/collector deploy --prod /app/apps/collector-deploy && \
    mkdir -p /app/apps/collector-deploy/dist && \
    cp -r /app/apps/collector/dist/* /app/apps/collector-deploy/dist/

# Stage 3: Final Image
FROM node:22-alpine AS production
RUN apk add --no-cache wget
WORKDIR /app

ENV NODE_ENV=production \
    WEB_PORT=3000 \
    API_PORT=3001 \
    COLLECTOR_WS_PORT=3002 \
    DB_PATH=/app/data/stats.db \
    NEXT_TELEMETRY_DISABLED=1

# Ensure data directory exists
RUN mkdir -p /app/data

# 1. Copy collector (deploy bundle with production deps)
COPY --from=builder /app/apps/collector-deploy ./apps/collector

# 2. Copy shared package
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# 3. Copy web (Next.js standalone)
COPY --from=builder /app/apps/web/.next/standalone ./apps/web/.next/standalone
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/standalone/apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/.next/standalone/apps/web/public

# 4. Copy start script
COPY docker-start.sh ./
RUN chmod +x docker-start.sh

EXPOSE 3000 3001 3002
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ["/bin/sh", "-c", "wget -q --spider http://127.0.0.1:${API_PORT}/health || exit 1"]

CMD ["./docker-start.sh"]
