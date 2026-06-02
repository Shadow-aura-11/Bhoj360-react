/**
 * Gateway — Reverse proxy that unifies all services behind a single port.
 *
 * Routing:
 *   /api/*                → Agency Core (port 3000)
 *   /r/:restaurantId/*    → Restaurant microservice (dynamic port lookup)
 *   /*                    → Vite dev server (dev) or frontend/dist (production)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.GATEWAY_PORT || 4000;
const AGENCY_PORT = process.env.AGENCY_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REGISTRY_PATH = path.join(__dirname, '..', 'agency-core', 'registry.json');

const app = express();
app.use(cors({ origin: '*' }));

// ─── Helpers ────────────────────────────────────────────────

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { restaurants: [] };
  }
}

function findRestaurantPort(restaurantId) {
  const registry = readRegistry();
  const entry = registry.restaurants.find((r) => r.id === restaurantId);
  return entry ? entry.port : null;
}

// ─── 1. Agency Core Proxy: /api/* → :3000 ──────────────────

app.use(
  '/api',
  createProxyMiddleware({
    target: `http://localhost:${AGENCY_PORT}`,
    changeOrigin: true,
    pathRewrite: (reqPath) => '/api' + reqPath,
    on: {
      error: (err, req, res) => {
        console.error('[Gateway] Agency Core proxy error:', err.message);
        if (res.writeHead) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Agency Core is unavailable' }));
        }
      },
    },
  })
);

// ─── 2. Restaurant Proxy: /r/:restaurantId/* → :31XX ───────

// Handle Socket.IO connections for restaurants
app.use('/r/:restaurantId/socket.io', (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const port = findRestaurantPort(restaurantId);

  if (!port) {
    return res.status(503).json({ error: `Restaurant ${restaurantId} not found` });
  }

  const proxy = createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: (reqPath) => {
      // Strip /r/:restaurantId prefix
      return reqPath.replace(`/r/${restaurantId}`, '');
    },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] Socket.IO proxy error for ${restaurantId}:`, err.message);
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Restaurant ${restaurantId} is offline` }));
        }
      },
    },
  });

  proxy(req, res, next);
});

// Handle REST API requests for restaurants
app.use('/r/:restaurantId', (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  const port = findRestaurantPort(restaurantId);

  if (!port) {
    return res.status(503).json({ error: `Restaurant ${restaurantId} not found` });
  }

  // Bypass proxy for non-API routes or HTML document requests (page navigation) so the React SPA handles routing
  const relativePath = req.path || '';
  const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons'];
  const isApiRequest = apiRoots.some((root) => relativePath.startsWith(root));
  const accept = req.headers.accept || '';

  if (!isApiRequest || accept.includes('text/html')) {
    return next();
  }

  const proxy = createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: (reqPath) => {
      // Strip /r/:restaurantId prefix
      return reqPath.replace(`/r/${restaurantId}`, '') || '/';
    },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] REST proxy error for ${restaurantId}:`, err.message);
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Restaurant ${restaurantId} is offline` }));
        }
      },
    },
  });

  proxy(req, res, next);
});

// ─── 3. Frontend: /* ────────────────────────────────────────

if (NODE_ENV === 'production') {
  // Serve built frontend assets
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Dev mode: proxy to Vite dev server
  app.use(
    '/',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
      on: {
        error: (err, req, res) => {
          // Vite might not be ready yet — return a friendly message
          if (res.writeHead) {
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a2e; color: #e0e0e0;">
                  <div style="text-align: center;">
                    <h1>⏳ Frontend is starting...</h1>
                    <p>Vite dev server is not ready yet. Refresh in a few seconds.</p>
                  </div>
                </body>
              </html>
            `);
          }
        },
      },
    })
  );
}

// ─── Start Server ───────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   🌐 Gateway — Reverse Proxy             ║');
  console.log(`  ║   Running on http://localhost:${PORT}        ║`);
  console.log(`  ║   Mode: ${NODE_ENV.padEnd(33)}║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  Routes:`);
  console.log(`    /api/*             → Agency Core (:${AGENCY_PORT})`);
  console.log(`    /r/:id/*           → Restaurant microservice`);
  console.log(`    /*                 → ${NODE_ENV === 'production' ? 'frontend/dist/' : 'Vite dev (:5173)'}`);
  console.log('');
});

// Handle WebSocket upgrades for restaurant Socket.IO
server.on('upgrade', (req, socket, head) => {
  // Check if this is a restaurant Socket.IO connection
  const match = req.url.match(/^\/r\/([^/]+)\//);
  if (match) {
    const restaurantId = match[1];
    const port = findRestaurantPort(restaurantId);

    if (port) {
      const proxy = createProxyMiddleware({
        target: `http://localhost:${port}`,
        ws: true,
        changeOrigin: true,
        pathRewrite: (reqPath) => {
          return reqPath.replace(`/r/${restaurantId}`, '');
        },
      });

      proxy.upgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  }
});

// Boot all registered restaurants on gateway startup
try {
  const { startAll } = require('../agency-core/startup');
  // Note: agency-core/index.js also calls startAll(), but if gateway starts alone
  // (e.g., in production via `pnpm start`), we need this fallback.
  // startup.js is idempotent in practice since detached processes won't duplicate.
} catch (err) {
  console.warn('[Gateway] Could not load startup module:', err.message);
}
