# nLab Search

A self-hosted full-text search over the [nLab](https://ncatlab.org) wiki.

## Quick start (Docker)

```sh
cp example.env .env
# edit .env: set MEILI_MASTER_KEY, and a MEILI_SEARCH_KEY / VITE_MEILI_SEARCH_KEY

docker compose up -d --build
```

- Web UI: <http://localhost:8080>
- Meilisearch: <http://localhost:7700>

The indexer clones the nlab-content repo into a volume on first run, then polls every `POLL_INTERVAL_MINUTES`. To avoid full clone, bind-mount an existing checkout instead.

### Creating a search-only key

Against a running Meilisearch:

```sh
curl -X POST http://localhost:7700/keys \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"actions":["search"],"indexes":["pages"],"expiresAt":null}' | jq -r .key
```

Put the returned key in `MEILI_SEARCH_KEY` / `VITE_MEILI_SEARCH_KEY`.

## Local development

```sh
cp example.env .env
ln -s ../../.env packages/indexer/.env

pnpm install

# run the indexer
pnpm -F indexer start

# dry-run extraction only
pnpm -F indexer count

# run the web ui
pnpm -F web start:dev
```

## Configuration

See [`example.env`](./example.env) for a full list of configuration options.

## License

The code is licensed under the [MIT license](./LICENSE).

All the nLab content is obtained from [`ncatlab/nlab-content`](https://github.com/ncatlab/nlab-content).
