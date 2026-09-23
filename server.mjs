#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const normalized = path.posix.normalize(decoded).replace(/^\/+/, '');
  const resolved = path.join(PUBLIC, normalized);
  if (resolved !== PUBLIC && !resolved.startsWith(PUBLIC + path.sep)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    res.end('ok');
    return;
  }

  let file = safePath(req.url);
  if (!file) {
    res.writeHead(400); res.end('Bad request'); return;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');

  // SPA-friendly fallback, while preserving real files such as sw.js and bareworker.js.
  if (!fs.existsSync(file)) file = path.join(PUBLIC, 'index.html');

  const ext = path.extname(file).toLowerCase();
  const headers = {
    'content-type': mime[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  };

  if (path.basename(file) === 'sw.js') {
    headers['cache-control'] = 'no-cache, no-store, must-revalidate';
    headers['service-worker-allowed'] = '/';
  }

  try {
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(500); res.end('Internal server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Blueberry GhostLink listening on http://${HOST}:${PORT}`);
});
