import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const preview = process.argv.includes('--dist');
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const base = resolve(root, preview ? 'dist' : pathname.startsWith('/images/') ? 'public' : 'src');
    const file = resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(base + sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`AMC website: http://localhost:${port} (${preview ? 'build preview' : 'editable source; refresh after saving changes'})`));
