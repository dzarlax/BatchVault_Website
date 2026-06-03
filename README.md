# BatchVault Website

Landing page and lead capture service for BatchVault.

The app is a Vite React frontend served by a small Fastify runtime. Lead requests are stored in SQLite and can optionally send Telegram notifications.

## Commands

```bash
npm ci
npm run dev
npm run check
npm run build
npm run start
```

## Development

The local dev compose stack keeps Vite hot reload and the Fastify API running together:

```bash
docker compose -f docker-compose.dev.yml up -d
```

The dev server serves the site on `http://localhost:5173` and proxies API calls to the Fastify server on port `8787`.

## Production Image

The runtime image is built from already-built frontend assets:

```bash
npm run build
docker build -f Dockerfile.image -t batchvault_website:test .
```

GitHub Actions publishes:

```text
ghcr.io/dzarlax/batchvault_website
```

The workflow first builds and uploads `dist/client`, then the Docker job downloads that artifact and builds the runtime image. Frontend build-time `node_modules` are not copied into the image.

## Environment

```text
PORT=8787
HOST=0.0.0.0
LEADS_DB_PATH=/data/leads.db
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

SQLite data should be mounted outside the image at `/data`.
