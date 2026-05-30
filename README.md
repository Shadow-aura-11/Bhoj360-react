# 🍽️ Restaurant Agency Management System

> **Multi-tenant SaaS platform for restaurant management** — powered by a microservice architecture where each restaurant runs as an isolated service.

---

## 📋 Overview

The Restaurant Agency Management System is a comprehensive platform that enables agencies to manage multiple restaurants from a single dashboard. Each restaurant is spun up as an independent microservice with its own database, menu, tables, orders, and reservations — all orchestrated by a central agency core and accessed through a unified API gateway.

```
┌────────────────────────────────────────────────────────────┐
│                    GATEWAY (:4000)                          │
│          Reverse proxy + static file server                │
├──────────────┬──────────────┬──────────────────────────────┤
│              │              │                              │
│   /api/*     │  /r/:id/*    │  /* (frontend)               │
│     │        │     │        │     │                        │
│     ▼        │     ▼        │     ▼                        │
│  ┌────────┐  │  ┌────────┐  │  ┌─────────────────┐        │
│  │AGENCY  │  │  │ROUTER  │  │  │ Vite Dev Server │        │
│  │CORE    │  │  │        │  │  │ (dev) or dist/  │        │
│  │(:3000) │  │  │        │  │  │ (production)    │        │
│  └───┬────┘  │  └───┬────┘  │  └─────────────────┘        │
│      │       │      │       │                              │
│      ▼       │      ▼       │                              │
│  registry    │  ┌────────┐ ┌────────┐ ┌────────┐          │
│  .json       │  │REST-001│ │REST-002│ │REST-00N│          │
│              │  │(:3100) │ │(:3101) │ │(:31XX) │          │
│              │  │        │ │        │ │        │          │
│              │  │config  │ │config  │ │config  │          │
│              │  │db.sqlite│ │db.sqlite│ │db.sqlite│          │
│              │  │service │ │service │ │service │          │
│              │  └────────┘ └────────┘ └────────┘          │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (`npm install -g pnpm`)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if you need to change ports or secrets
```

### 3. Run in Development Mode

```bash
pnpm dev
```

This starts three services concurrently:
- **Agency Core** on `http://localhost:3000`
- **Gateway** on `http://localhost:4000`
- **Vite Dev Server** on `http://localhost:5173`

### 4. Open the Application

Navigate to **http://localhost:4000** — the gateway serves everything.

---

## 📖 First Steps

1. Open the **Agency Dashboard** at `http://localhost:4000`
2. Click **"Create Restaurant"**
3. Enter a name and table count (default: 8)
4. The system spins up an isolated microservice with its own database
5. Access the restaurant's admin panel via the dashboard

### Default PINs

| Role     | PIN    | Access Level                     |
|----------|--------|----------------------------------|
| Admin    | `1111` | Full access, settings, analytics |
| Waiter   | `2222` | Orders, tables, reservations     |
| Counter  | `3333` | Orders, billing                  |
| Customer | `0000` | Self-order via QR code           |

---

## 🔌 API Quick Start

### Create a Restaurant

```bash
curl -X POST http://localhost:4000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name": "My Restaurant", "tableCount": 8}'
```

### List All Restaurants

```bash
curl http://localhost:4000/api/restaurants
```

### Access a Restaurant's Menu

```bash
curl http://localhost:4000/r/REST-XXXXXX/menu
```

### Create an Order (Staff)

```bash
curl -X POST http://localhost:4000/r/REST-XXXXXX/orders \
  -H 'Content-Type: application/json' \
  -H 'x-role: waiter' \
  -H 'x-pin: 2222' \
  -d '{
    "table_id": 1,
    "items": [
      { "menu_item_id": 1, "quantity": 2 },
      { "menu_item_id": 5, "quantity": 1 }
    ]
  }'
```

---

## 🏗️ Architecture

### Monorepo Structure

```
restaurant-agency/
├── agency-core/          # Central management API
│   ├── index.js          # Express server (:3000)
│   ├── restaurant-factory.js  # Spins up new restaurants
│   ├── startup.js        # Boots all registered restaurants
│   ├── service-template.js    # Template for each restaurant
│   └── registry.json     # Restaurant registry
├── gateway/              # Reverse proxy (:4000)
│   └── index.js          # Routes to agency-core + restaurants
├── frontend/             # React + Vite + TailwindCSS
│   └── src/              # UI components and pages
├── restaurants/          # Auto-generated per restaurant
│   └── REST-XXXXXX/
│       ├── config.json   # Restaurant configuration
│       ├── db.sqlite     # Isolated SQLite database
│       └── service.js    # Running microservice
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspace definition
└── .env.example          # Environment variables template
```

### Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, TailwindCSS         |
| Gateway     | Express, http-proxy-middleware       |
| Agency Core | Express, Node.js                     |
| Microservice| Express, Socket.IO, better-sqlite3  |
| Database    | SQLite (one per restaurant)          |
| QR Codes    | qrcode (PNG generation)              |
| Packaging   | pnpm workspaces, concurrently        |

### Key Design Decisions

- **Isolation**: Each restaurant gets its own SQLite database and Express process — no data leaks between tenants.
- **Dynamic provisioning**: Restaurants are created at runtime via API, with automatic port allocation and service spawning.
- **QR-based self-ordering**: Each table has a unique QR token for customers to place orders directly.
- **Real-time updates**: Socket.IO provides live order and table status updates to all connected clients.
- **PIN-based auth**: Simple role-based authentication using 4-digit PINs (no complex OAuth needed for restaurant staff).

---

## 📡 Real-Time Events (Socket.IO)

Connect to a restaurant's Socket.IO at:
```
http://localhost:4000/r/REST-XXXXXX/socket.io
```

### Events Emitted

| Event                  | Payload                    | Description                     |
|------------------------|----------------------------|---------------------------------|
| `snapshot`             | `{ tables: [...] }`       | Full table status on connect    |
| `order:new`            | `{ order }`               | New order created               |
| `order:updated`        | `{ order }`               | Order status changed            |
| `order:itemAdded`      | `{ order }`               | Items added to order            |
| `table:added`          | `{ table }`               | New table created               |
| `table:updated`        | `{ table }`               | Table info changed              |
| `table:deleted`        | `{ tableId }`             | Table removed                   |
| `table:statusChanged`  | `{ tableId, status }`     | Table status updated            |
| `menu:updated`         | `{}`                       | Menu changed                    |
| `reservation:new`      | `{ reservation }`         | New reservation                 |
| `reservation:updated`  | `{ reservation }`         | Reservation changed             |
| `reservation:cancelled`| `{ reservationId }`       | Reservation cancelled           |
| `reservation:reminder` | `{ reservation }`         | 15-min upcoming reminder        |
| `waiter:called`        | `{ table }`               | Customer called waiter via QR   |

---

## 📄 License

MIT
