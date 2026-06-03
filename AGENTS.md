# BatchVault Website

## Commands

- Install dependencies: `npm ci`
- Start local dev: `npm run dev`
- Type check: `npm run check`
- Build frontend: `npm run build`
- Start production server after build: `npm run start`
- Dev compose: `docker compose -f docker-compose.dev.yml up -d`

## Architecture

- `src/` contains the Vite React landing page.
- `server/index.js` contains the Fastify API, static frontend serving, SQLite lead storage, rate limiting, and optional Telegram notifications.
- `vite.config.ts` builds frontend assets to `dist/client`.
- `Dockerfile.image` expects `dist/client` to already exist and builds a runtime-only image from production dependencies plus the built frontend.
- `.github/workflows/build-image.yml` builds frontend assets in one job, then builds and pushes the runtime image in a second job.

## Environment Variables

- `PORT`: Fastify port, default `8787`.
- `HOST`: Fastify host, default `0.0.0.0`.
- `LEADS_DB_PATH`: SQLite path, default `.data/leads.db` locally and `/data/leads.db` in containers.
- `TELEGRAM_BOT_TOKEN`: optional Telegram bot token for lead notifications.
- `TELEGRAM_CHAT_ID`: optional Telegram chat id for lead notifications.
