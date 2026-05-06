import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const STATIC_DIR = join(__dirname, 'dist', 'client');
const PORT = process.env.PORT || 8080;

let worker;
async function getWorker() {
  if (!worker) {
    const mod = await import('./dist/server/index.js');
    worker = mod.default;
  }
  return worker;
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.webp': 'image/webp',
};

function serveStatic(filePath, res) {
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  createReadStream(filePath).pipe(res);
}

function createAssetsBinding(staticDir) {
  return {
    async fetch(request) {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname);
      const filePath = join(staticDir, pathname);

      try {
        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const ext = extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          return new Promise((resolve) => {
            const chunks = [];
            const stream = createReadStream(filePath);
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => {
              resolve(new Response(Buffer.concat(chunks), {
                status: 200,
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=31536000, immutable',
                },
              }));
            });
            stream.on('error', () => resolve(new Response('Not Found', { status: 404 })));
          });
        }
      } catch {}

      return new Response('Not Found', { status: 404 });
    },
  };
}

const server = createServer(async (req, res) => {
  try {
    // Serve static assets directly — don't go through the worker for these
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    const staticPath = join(STATIC_DIR, pathname);
    try {
      if (existsSync(staticPath) && statSync(staticPath).isFile()) {
        serveStatic(staticPath, res);
        return;
      }
    } catch {}

    // Everything else goes through the SSR worker
    const w = await getWorker();
    const host = req.headers.host || `localhost:${PORT}`;
    const url = `http://${host}${req.url}`;

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyData = Buffer.concat(chunks);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
      else if (value) headers.set(key, value);
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: bodyData.length > 0 && req.method !== 'GET' && req.method !== 'HEAD'
        ? bodyData
        : undefined,
    });

    const env = { ASSETS: createAssetsBinding(STATIC_DIR) };
    const ctx = {
      waitUntil: (promise) => { promise.catch(console.error); },
      passThroughOnException: () => {},
    };

    const webResponse = await w.fetch(webRequest, env, ctx);

    res.statusCode = webResponse.status;
    for (const [key, value] of webResponse.headers.entries()) {
      if (key.toLowerCase() !== 'transfer-encoding') res.setHeader(key, value);
    }

    res.end(Buffer.from(await webResponse.arrayBuffer()));
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CMB server running on port ${PORT}`);
});
