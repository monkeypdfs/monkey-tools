# syntax=docker/dockerfile:1.6
ARG NODE_VERSION=20.19.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PNPM_VERSION=10.26.2 \
    PATH="${PNPM_HOME}:${PATH}"
ENV CI=true
WORKDIR /app
# Corepack key retrieval can fail in minimal images; install pnpm directly to keep builds stable
RUN npm install -g pnpm@${PNPM_VERSION}

FROM base AS deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json turbo.json biome.json ./
COPY apps/worker/package.json apps/worker/tsconfig.json apps/worker/
COPY packages/database/package.json packages/database/tsconfig.json packages/database/
COPY packages/queue/package.json packages/queue/tsconfig.json packages/queue/
COPY packages/storage/package.json packages/storage/tsconfig.json packages/storage/
COPY packages/types/package.json packages/types/tsconfig.json packages/types/
COPY packages/typescript-config/ packages/typescript-config/
RUN pnpm install --frozen-lockfile

FROM deps AS build
# Copy all source files needed for build
COPY apps/worker/src apps/worker/src
COPY packages/database/src packages/database/src
COPY packages/queue/src packages/queue/src
COPY packages/storage/src packages/storage/src
COPY packages/types/src packages/types/src
# Build worker and its dependencies
RUN pnpm --filter=worker... build

FROM base AS deploy
WORKDIR /app
# Use pnpm deploy to create a standalone deployment with all dependencies
COPY --from=deps /app .
RUN pnpm deploy --filter=worker --prod --legacy /deploy

FROM node:${NODE_VERSION}-bookworm-slim AS runner
RUN apt-get update \
 && apt-get install -y --no-install-recommends ghostscript ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
# Copy the deployed worker with all its dependencies
COPY --from=deploy /deploy .
# Copy compiled output from build stage
COPY --from=build /app/apps/worker/dist ./dist
COPY --from=build /app/packages/database/dist ./node_modules/@workspace/database/dist
COPY --from=build /app/packages/queue/dist ./node_modules/@workspace/queue/dist
COPY --from=build /app/packages/storage/dist ./node_modules/@workspace/storage/dist
COPY --from=build /app/packages/types/dist ./node_modules/@workspace/types/dist
USER node
CMD ["node", "dist/index.js"]
