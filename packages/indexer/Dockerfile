# Build context is the monorepo root (see compose.yaml).
FROM node:24-slim

# git is required at runtime to clone/fetch/diff the content repo.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends git ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Install deps using the workspace lockfile (only the indexer package is needed).
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/indexer/package.json packages/indexer/package.json
RUN pnpm install --filter @nlab-search/indexer --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/indexer ./packages/indexer

WORKDIR /app/packages/indexer
CMD ["pnpm", "start"]
