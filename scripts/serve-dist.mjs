/**
 * Sert le build de production localement (avec fallback SPA + service worker).
 * Usage : npm run build && npm run preview   → http://localhost:4300
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'ldva', 'browser');
const PORT = process.env.PORT ? Number(process.env.PORT) : 4300;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.map': 'application/json',
};

if (!fs.existsSync(ROOT)) {
  console.error(`Build introuvable : ${ROOT}\nLancez d'abord « npm run build ».`);
  process.exit(1);
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, urlPath);
  fs.readFile(file, (err, data) => {
    if (err) {
      if (!path.extname(urlPath)) {
        fs.readFile(path.join(ROOT, 'index.html'), (e2, html) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': TYPES['.html'] }); res.end(html);
        });
        return;
      }
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`▶ Little Domo — http://localhost:${PORT}`));
