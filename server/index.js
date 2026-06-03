import fastifyStatic from '@fastify/static';
import Database from 'better-sqlite3';
import Fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const dbPath = process.env.LEADS_DB_PATH || path.join(rootDir, '.data', 'leads.db');
const sqliteDir = path.dirname(dbPath);

fs.mkdirSync(sqliteDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS landing_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    contact TEXT NOT NULL,
    product TEXT,
    message TEXT,
    language TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'batchvault-landing',
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const insertLead = db.prepare(`
  INSERT INTO landing_leads (name, contact, product, message, language, source, user_agent)
  VALUES (@name, @contact, @product, @message, @language, @source, @userAgent)
`);

const app = Fastify({
  logger: true,
  bodyLimit: 16 * 1024
});

const buckets = new Map();

function tooManyRequests(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 8;
  const bucket = buckets.get(ip) || [];
  const recent = bucket.filter((time) => now - time < windowMs);
  recent.push(now);
  buckets.set(ip, recent);
  return recent.length > limit;
}

function sanitizeString(value, max) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, max);
}

function formatTelegramMessage(lead) {
  const lines = [
    'New BatchVault lead',
    `Language: ${lead.language}`,
    `Name: ${lead.name || '-'}`,
    `Contact: ${lead.contact}`,
    `Product: ${lead.product || '-'}`,
    `Message: ${lead.message || '-'}`
  ];
  return lines.join('\n');
}

async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatTelegramMessage(lead),
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram returned ${response.status}`);
  }
}

app.get('/healthz', async () => ({ ok: true }));

app.post('/api/leads', async (request, reply) => {
  const ip = request.ip || 'unknown';

  if (tooManyRequests(ip)) {
    return reply.code(429).send({ error: 'rate_limited' });
  }

  const body = request.body || {};
  const honeypot = sanitizeString(body.company, 120);
  if (honeypot) {
    return reply.code(204).send();
  }

  const lead = {
    name: sanitizeString(body.name, 120),
    contact: sanitizeString(body.contact, 180),
    product: sanitizeString(body.product, 180),
    message: sanitizeString(body.message, 1200),
    language: sanitizeString(body.language, 8),
    source: sanitizeString(body.source, 80) || 'batchvault-landing',
    userAgent: sanitizeString(request.headers['user-agent'], 500)
  };

  if (!lead.contact) {
    return reply.code(400).send({ error: 'contact_required' });
  }

  if (!['sr', 'ru', 'en'].includes(lead.language)) {
    lead.language = 'sr';
  }

  const result = insertLead.run(lead);

  try {
    await notifyTelegram(lead);
  } catch (error) {
    app.log.warn({ err: error }, 'telegram notification failed');
  }

  return reply.code(201).send({ ok: true, id: result.lastInsertRowid });
});

if (isProduction) {
  const distDir = path.join(rootDir, 'dist', 'client');
  app.register(fastifyStatic, {
    root: distDir,
    prefix: '/'
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.raw.method === 'GET' && !request.url.startsWith('/api/')) {
      return reply.sendFile('index.html');
    }
    return reply.code(404).send({ error: 'not_found' });
  });
}

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
