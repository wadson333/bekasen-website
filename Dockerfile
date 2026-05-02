# syntax=docker/dockerfile:1.7-labs
# ─────────────────────────────────────────────────────────────────────────────
# Bekasen — production Dockerfile (multi-stage, Next.js 16 + standalone output)
# Build: docker build -t bekasen-web:latest .
# Run:   docker compose up -d (see docker-compose.yml)
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20.18-alpine

# ─── Stage 1: deps — install only what's needed to build ──────────────────────
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ─── Stage 2: builder — compile Next.js (standalone output) ───────────────────
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next telemetry during build (privacy + slightly faster).
ENV NEXT_TELEMETRY_DISABLED=1
# Build args usable at compile time (placeholders OK; runtime env still wins).
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://bekasen.com}

RUN npm run build

# ─── Stage 3: runner — minimal final image ────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# Run as non-root for safety. The standalone server only needs read access.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bind to all interfaces so docker-compose can route traffic in.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy the standalone server (next.config.ts must set output: 'standalone').
# This bundles only the deps used at runtime (no devDependencies, no source).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Drizzle schema + compiled migrations needed only if running `node` scripts.
# Migration step is run from a separate `migrate` service in docker-compose.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs
EXPOSE 3000

# Healthcheck via the homepage (cheap, always reachable).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
