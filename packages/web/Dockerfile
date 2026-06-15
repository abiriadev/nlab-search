# Build context is the monorepo root (see compose.yaml).
FROM node:24-slim AS build

RUN corepack enable
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/web/package.json packages/web/package.json
RUN pnpm install --filter @nlab-search/web --frozen-lockfile

COPY packages/web ./packages/web

# VITE_* are baked into the bundle at build time.
ARG VITE_MEILI_HOST
ARG VITE_MEILI_SEARCH_KEY
ARG VITE_MEILI_INDEX
ENV VITE_MEILI_HOST=$VITE_MEILI_HOST \
	VITE_MEILI_SEARCH_KEY=$VITE_MEILI_SEARCH_KEY \
	VITE_MEILI_INDEX=$VITE_MEILI_INDEX

WORKDIR /app/packages/web
RUN pnpm build

FROM nginx:alpine
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/web/dist /usr/share/nginx/html
