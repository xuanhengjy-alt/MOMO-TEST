// Simple Node static server for the frontend (no extra deps)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body) res.end(body); else res.end();
}

function safeJoin(base, target) {
  const resolved = path.resolve(base, '.' + target);
  if (!resolved.startsWith(base)) return null; // path traversal guard
  return resolved;
}

const server = http.createServer((req, res) => {
  try {
    const url = req.url || '/';
    let filePath = url.split('?')[0].split('#')[0];
    if (filePath === '/' || filePath === '') filePath = '/index.html';

    const abs = safeJoin(ROOT, filePath);
    if (!abs) return send(res, 400, { 'Content-Type': 'text/plain' }, 'Bad Request');

    fs.stat(abs, (err, stat) => {
      if (err || !stat.isFile()) {
        return send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
      }
      const ext = path.extname(abs).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      const stream = fs.createReadStream(abs);
      // Disable cache during dev
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      });
      stream.pipe(res);
      stream.on('error', () => send(res, 500, { 'Content-Type': 'text/plain' }, 'Server Error'));
    });
  } catch (e) {
    send(res, 500, { 'Content-Type': 'text/plain' }, 'Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Frontend static server running at http://localhost:${PORT}/`);
});


