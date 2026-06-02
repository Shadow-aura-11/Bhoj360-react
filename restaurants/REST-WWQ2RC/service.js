const RESTAURANT_ID = 'REST-WWQ2RC';
const PORT = 3101;
/**
 * Restaurant Microservice — Service Template
 * ═══════════════════════════════════════════
 * This file is copied per restaurant by the factory.
 * The factory injects RESTAURANT_ID and PORT at the top.
 *
 * DO NOT add RESTAURANT_ID or PORT here — they are injected at copy time.
 */

// ─── Dependencies ───────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const Database = require('better-sqlite3');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Setup ──────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: { origin: '*' },
});

const DB_PATH = path.join(__dirname, 'db.sqlite');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const QR_SECRET_SALT = process.env.QR_SECRET_SALT || 'change-this-in-production';
const GATEWAY_PORT = process.env.GATEWAY_PORT || 4000;

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema migrations for existing databases
try {
  db.exec("ALTER TABLE orders ADD COLUMN customer_phone TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN settled_by TEXT DEFAULT 'System';");
} catch (e) {}
try {
  db.exec("ALTER TABLE order_items ADD COLUMN is_addon INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'unpaid';");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN settled_at DATETIME;");
} catch (e) {}
try {
  db.exec("ALTER TABLE menu_items ADD COLUMN image_url TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN customer_name TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN waiter_name TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN cash_amount REAL DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN online_amount REAL DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN coupon_code TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN whatsapp_sent INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE menu_items ADD COLUMN sort_order INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE order_items ADD COLUMN addons_json TEXT;");
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_item_addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

// ─── Auth Middleware ────────────────────────────────────────

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const role = req.headers['x-role'];
    const pin = req.headers['x-pin'];
    const username = req.headers['x-username'];
    const config = readConfig();

    if (!role || !pin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let authenticated = false;

    // 1. Check if matching role PIN fallback for configured legacy roles
    if (config.pins[role] && config.pins[role] === pin.toString()) {
      authenticated = true;
    } 
    // 2. Otherwise, check if user credentials exist in the staff table
    else if (username) {
      try {
        const user = db.prepare('SELECT * FROM staff WHERE username = ? AND pin = ? AND role = ?').get(username.toString().trim(), pin.toString(), role);
        if (user) {
          authenticated = true;
          req.staffName = user.name;
        }
      } catch (err) {
        console.error('Error validating staff credentials in authMiddleware:', err);
      }
    } 
    // 3. Fallback: check if any staff member matches this PIN and role (e.g. if username header is missing but credential PIN is unique)
    else {
      try {
        const user = db.prepare('SELECT * FROM staff WHERE pin = ? AND role = ?').get(pin.toString(), role);
        if (user) {
          authenticated = true;
          req.staffName = user.name;
        }
      } catch (err) {
        console.error('Error validating staff PIN in authMiddleware:', err);
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid PIN or credentials' });
    }

    if (requiredRole === 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (requiredRole === 'staff' && !['admin', 'waiter', 'counter', 'cashier'].includes(role)) {
      return res.status(403).json({ error: 'Staff access required' });
    }

    req.role = role;
    next();
  };
}

// ─── Table Auto-Status ─────────────────────────────────────

function updateTableStatus(tableId) {
  // Check active orders on this table
  const activeOrder = db
    .prepare(
      "SELECT id, status FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(tableId);

  let newStatus = 'available';

  if (activeOrder) {
    if (activeOrder.status === 'pending') {
      newStatus = 'pending';
    } else if (activeOrder.status === 'preparing') {
      newStatus = 'preparing';
    } else if (activeOrder.status === 'ready') {
      newStatus = 'ready';
    } else if (activeOrder.status === 'served') {
      newStatus = 'occupied';
    }
  } else {
    // Check for upcoming reservations within 60 minutes
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = db
      .prepare(
        "SELECT id FROM reservations WHERE table_id = ? AND reservation_date = ? AND status = 'confirmed'"
      )
      .all(tableId, today);

    for (const resv of upcoming) {
      const full = db.prepare('SELECT reservation_time FROM reservations WHERE id = ?').get(resv.id);
      if (full) {
        const [h, m] = full.reservation_time.split(':').map(Number);
        const resvMinutes = h * 60 + m;
        if (resvMinutes - currentMinutes <= 60 && resvMinutes - currentMinutes > 0) {
          newStatus = 'reserved';
          break;
        }
      }
    }
  }

  db.prepare('UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    newStatus,
    tableId
  );

  io.to('restaurant').emit('table:statusChanged', { tableId, status: newStatus });
  return newStatus;
}

// ─── QR Token Helpers ───────────────────────────────────────

function generateQrToken(tableNumber) {
  return crypto
    .createHash('sha256')
    .update(RESTAURANT_ID + tableNumber + QR_SECRET_SALT)
    .digest('hex');
}

function validateQrToken(tableNumber, token) {
  const table = db.prepare('SELECT id, qr_token, status FROM tables WHERE number = ?').get(tableNumber);
  if (!table) return null;
  if (table.qr_token !== token) return null;
  return table;
}

// ─── Health ─────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const config = readConfig();
  res.json({
    status: 'ok',
    restaurantId: RESTAURANT_ID,
    name: config.name,
    logo_url: config.logo_url || '',
    description: config.description || '',
    logout_redirect_url: config.logout_redirect_url || '',
    login_theme_color: config.login_theme_color || '#fafaf9',
    theme: config.qr_theme || 'classic',
    uptime: process.uptime(),
  });
});

app.get('/manifest.json', (req, res) => {
  const config = readConfig();
  const name = config.name || 'Restaurant App';
  const logo = config.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=192';
  
  res.json({
    short_name: name,
    name: name,
    icons: [
      {
        src: logo,
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/any"
      },
      {
        src: logo,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    start_url: `/r/${RESTAURANT_ID}/login`,
    background_color: "#ffffff",
    theme_color: "#ffffff",
    display: "standalone",
    orientation: "portrait"
  });
});

// ─── Auth ───────────────────────────────────────────────────

app.post('/auth', (req, res) => {
  const { role, pin, username } = req.body;
  const config = readConfig();

  // If logging in as admin (requires role: admin and pin/password)
  if (role === 'admin') {
    if (!pin) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (config.pins.admin !== pin.toString()) {
      return res.status(401).json({ error: 'Invalid Admin Password' });
    }
    db.prepare('INSERT INTO sessions (role) VALUES (?)').run('admin');
    return res.json({ role: 'admin', restaurantId: RESTAURANT_ID, name: config.name, staffName: 'Admin' });
  }

  // If logging in as staff member (requires username/number and pin/password)
  if (username && pin) {
    try {
      const user = db.prepare('SELECT * FROM staff WHERE (username = ? OR name = ?) AND pin = ?').get(username.toString().trim(), username.toString().trim(), pin.toString());
      if (!user) {
        return res.status(401).json({ error: 'Invalid Staff ID/Number or Password' });
      }
      db.prepare('INSERT INTO sessions (role) VALUES (?)').run(user.role);
      return res.json({
        role: user.role,
        restaurantId: RESTAURANT_ID,
        name: config.name,
        staffName: user.name,
        username: user.username,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Authentication database error' });
    }
  }

  // Legacy role-based login fallback (e.g. customer seating or fallback PINS)
  if (role && pin) {
    if (role === 'customer') {
      if (!config.pins[role]) {
        return res.status(401).json({ error: 'Invalid role' });
      }
      if (config.pins[role] !== pin.toString()) {
        return res.status(401).json({ error: 'Invalid Password' });
      }
      db.prepare('INSERT INTO sessions (role) VALUES (?)').run(role);
      return res.json({ role, restaurantId: RESTAURANT_ID, name: config.name, staffName: role.toUpperCase() });
    }
    return res.status(401).json({ error: 'Global role login is disabled. Please log in with your Staff account.' });
  }

  return res.status(400).json({ error: 'Invalid login request' });
});

// GET /staff — List all staff members [ADMIN]
app.get('/staff', authMiddleware('admin'), (req, res) => {
  try {
    const staff = db.prepare('SELECT id, username, name, role, pin, created_at FROM staff ORDER BY role, name').all();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve staff list' });
  }
});

// POST /staff — Add a new staff member [ADMIN]
app.post('/staff', authMiddleware('admin'), (req, res) => {
  const { username, name, role, pin } = req.body;
  if (!username || !name || !role || !pin) {
    return res.status(400).json({ error: 'Username, Name, Role, and PIN are required' });
  }
  if (!['waiter', 'counter', 'cashier'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (pin.toString().length < 4) {
    return res.status(400).json({ error: 'PIN must be at least 4 digits' });
  }

  try {
    const existing = db.prepare('SELECT id FROM staff WHERE username = ?').get(username.toString().trim());
    if (existing) {
      return res.status(409).json({ error: 'Staff ID/Number already exists' });
    }

    db.prepare('INSERT INTO staff (username, name, role, pin) VALUES (?, ?, ?, ?)').run(
      username.toString().trim(),
      name.trim(),
      role,
      pin.toString()
    );
    res.status(201).json({ message: 'Staff member added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// DELETE /staff/:id — Delete a staff member [ADMIN]
app.delete('/staff/:id', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// GET /settings/pins — Get current role login PINs [ADMIN]
app.get('/settings/pins', authMiddleware('admin'), (req, res) => {
  const config = readConfig();
  res.json({ pins: config.pins });
});

// PUT /settings/pins — Update login credentials (PINs/passwords) for waiter, counter, cashier, admin [ADMIN]
app.put('/settings/pins', authMiddleware('admin'), (req, res) => {
  const { admin, waiter, counter, cashier } = req.body;
  const config = readConfig();

  if (admin !== undefined) {
    if (admin.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.admin = admin.toString();
  }
  if (waiter !== undefined) {
    if (waiter.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.waiter = waiter.toString();
  }
  if (counter !== undefined) {
    if (counter.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.counter = counter.toString();
  }
  if (cashier !== undefined) {
    if (cashier.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.cashier = cashier.toString();
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  // Proactively update registry.json in agency-core
  try {
    const agencyRegistryPath = path.join(__dirname, '..', '..', 'agency-core', 'registry.json');
    if (fs.existsSync(agencyRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(agencyRegistryPath, 'utf8'));
      const rIndex = reg.restaurants.findIndex(r => r.id === RESTAURANT_ID);
      if (rIndex !== -1) {
        reg.restaurants[rIndex].pins = config.pins;
        fs.writeFileSync(agencyRegistryPath, JSON.stringify(reg, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.error('Failed to sync settings with agency registry:', e.message);
  }

  res.json({ message: 'Login credentials updated successfully', pins: config.pins });
});

// GET /settings/printer — Get current printer configs [ADMIN]
app.get('/settings/printer', authMiddleware('admin'), (req, res) => {
  const config = readConfig();
  res.json({ printer: config.printer || { enabled: false, size: '80mm' } });
});

// PUT /settings/printer — Update printer configs [ADMIN]
app.put('/settings/printer', authMiddleware('admin'), (req, res) => {
  const { enabled, size } = req.body;
  const config = readConfig();

  config.printer = {
    enabled: !!enabled,
    size: size === '58mm' ? '58mm' : '80mm'
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  res.json({ message: 'Printer settings updated successfully', printer: config.printer });
});

// GET /customers — Retrieve customer records and total statistics [ADMIN]
app.get('/customers', authMiddleware('admin'), (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT 
        phone,
        MAX(name) AS name,
        MAX(email) AS email,
        SUM(order_count) AS order_count,
        SUM(total_spend) AS total_spend,
        SUM(resv_count) AS reservation_count,
        MAX(last_visit) AS last_visit
      FROM (
        SELECT 
          customer_phone AS phone,
          customer_name AS name,
          NULL AS email,
          COUNT(id) AS order_count,
          SUM(total) AS total_spend,
          0 AS resv_count,
          MAX(created_at) AS last_visit
        FROM orders
        WHERE customer_phone IS NOT NULL AND customer_phone != ''
        GROUP BY customer_phone
        
        UNION ALL
        
        SELECT 
          customer_phone AS phone,
          customer_name AS name,
          customer_email AS email,
          0 AS order_count,
          0 AS total_spend,
          COUNT(id) AS resv_count,
          MAX(reservation_date || ' ' || reservation_time) AS last_visit
        FROM reservations
        WHERE customer_phone IS NOT NULL AND customer_phone != ''
        GROUP BY customer_phone
      )
      GROUP BY phone
      ORDER BY last_visit DESC
    `).all();

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve customer records' });
  }
});

// ═══════════════════════════════════════════════════════════
//  TABLES API
// ═══════════════════════════════════════════════════════════

// GET /tables — All tables with active order + next reservation
app.get('/tables', (req, res) => {
  const tables = db.prepare('SELECT * FROM tables ORDER BY section, number').all();

  const enriched = tables.map((table) => {
    const activeOrder = db
      .prepare(
        "SELECT id, status, total, created_at FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
      )
      .get(table.id);

    const today = new Date().toISOString().split('T')[0];
    const nextReservation = db
      .prepare(
        "SELECT id, customer_name, party_size, reservation_time FROM reservations WHERE table_id = ? AND reservation_date >= ? AND status = 'confirmed' ORDER BY reservation_date, reservation_time LIMIT 1"
      )
      .get(table.id, today);

    return { ...table, activeOrder: activeOrder || null, nextReservation: nextReservation || null };
  });

  res.json(enriched);
});

// GET /tables/status — Compact status
app.get('/tables/status', (req, res) => {
  const tables = db.prepare('SELECT id, number, status, section FROM tables ORDER BY section, number').all();
  res.json(tables);
});

// GET /tables/sections — Distinct sections
app.get('/tables/sections', (req, res) => {
  const sections = db.prepare('SELECT DISTINCT section FROM tables').all();
  res.json(sections.map((s) => s.section));
});

// GET /tables/:id — Single table
app.get('/tables/:id', (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const activeOrder = db
    .prepare(
      "SELECT id, status, total, created_at FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(table.id);

  const today = new Date().toISOString().split('T')[0];
  const nextReservation = db
    .prepare(
      "SELECT id, customer_name, party_size, reservation_time FROM reservations WHERE table_id = ? AND reservation_date >= ? AND status = 'confirmed' ORDER BY reservation_date, reservation_time LIMIT 1"
    )
    .get(table.id, today);

  res.json({ ...table, activeOrder: activeOrder || null, nextReservation: nextReservation || null });
});

// POST /tables — Create table [ADMIN]
app.post('/tables', authMiddleware('admin'), (req, res) => {
  const { number, capacity = 4, section = 'Main' } = req.body;

  if (!number) return res.status(400).json({ error: 'Table number is required' });

  // Check unique
  const existing = db.prepare('SELECT id FROM tables WHERE number = ?').get(number);
  if (existing) return res.status(409).json({ error: `Table ${number} already exists` });

  const qrToken = generateQrToken(number);
  const result = db
    .prepare(
      'INSERT INTO tables (number, capacity, section, qr_token, qr_generated_at) VALUES (?, ?, ?, ?, ?)'
    )
    .run(number, capacity, section, qrToken, new Date().toISOString());

  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(result.lastInsertRowid);
  io.to('restaurant').emit('table:added', { table });
  res.status(201).json(table);
});

// PUT /tables/:id — Update table [ADMIN/STAFF]
app.put('/tables/:id', authMiddleware('staff'), (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const role = req.role;
  const { number, capacity, section, status } = req.body;

  if (role !== 'admin') {
    if (status) {
      db.prepare('UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
      const updated = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
      io.to('restaurant').emit('table:updated', { table: updated });
      return res.json(updated);
    }
    return res.status(403).json({ error: 'Only admin can modify table details' });
  }

  // Block number change if active order
  if (number && number.toString().toLowerCase() !== table.number.toString().toLowerCase()) {
    const activeOrder = db
      .prepare("SELECT id FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') LIMIT 1")
      .get(table.id);
    if (activeOrder) {
      return res.status(400).json({ error: 'Cannot change table number while an active order exists' });
    }

    // Check unique
    const existing = db.prepare('SELECT id FROM tables WHERE LOWER(number) = LOWER(?) AND id != ?').get(number.toString(), table.id);
    if (existing) return res.status(409).json({ error: `Table ${number} already exists` });
  }

  db.prepare(
    'UPDATE tables SET number = COALESCE(?, number), capacity = COALESCE(?, capacity), section = COALESCE(?, section), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(number || null, capacity || null, section || null, status || null, req.params.id);

  const updated = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  io.to('restaurant').emit('table:updated', { table: updated });
  res.json(updated);
});

// DELETE /tables/:id — Delete table [ADMIN]
app.delete('/tables/:id', authMiddleware('admin'), (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const activeOrder = db
    .prepare("SELECT id FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') LIMIT 1")
    .get(table.id);
  if (activeOrder) {
    return res.status(400).json({ error: 'Cannot delete table with active order' });
  }

  db.prepare('DELETE FROM tables WHERE id = ?').run(req.params.id);
  io.to('restaurant').emit('table:deleted', { tableId: Number(req.params.id) });
  res.json({ message: 'Table deleted' });
});

// POST /tables/bulk — Create multiple tables [ADMIN]
app.post('/tables/bulk', authMiddleware('admin'), (req, res) => {
  const { tables: tableDefs } = req.body;

  if (!Array.isArray(tableDefs) || tableDefs.length === 0) {
    return res.status(400).json({ error: 'Tables array is required' });
  }

  const created = [];
  const errors = [];

  const insertStmt = db.prepare(
    'INSERT INTO tables (number, capacity, section, qr_token, qr_generated_at) VALUES (?, ?, ?, ?, ?)'
  );

  const bulkInsert = db.transaction(() => {
    for (const def of tableDefs) {
      const { number, capacity = 4, section = 'Main' } = def;
      if (!number) {
        errors.push({ number, error: 'Table number is required' });
        continue;
      }
      const existing = db.prepare('SELECT id FROM tables WHERE number = ?').get(number);
      if (existing) {
        errors.push({ number, error: `Table ${number} already exists` });
        continue;
      }
      const qrToken = generateQrToken(number);
      const result = insertStmt.run(number, capacity, section, qrToken, new Date().toISOString());
      const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(result.lastInsertRowid);
      created.push(table);
    }
  });

  bulkInsert();

  for (const table of created) {
    io.to('restaurant').emit('table:added', { table });
  }

  res.status(201).json({ created, errors });
});

// GET /tables/:id/qr — Generate QR code
app.get('/tables/:id/qr', async (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const url = `http://localhost:${GATEWAY_PORT}/r/${RESTAURANT_ID}/menu?table=${table.number}&token=${table.qr_token}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    res.json({ qr: qrDataUrl, url, tableNumber: table.number });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /tables/:id/qr/regenerate — Regenerate QR token [ADMIN]
app.post('/tables/:id/qr/regenerate', authMiddleware('admin'), (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const newToken = generateQrToken(table.number + Date.now());
  db.prepare('UPDATE tables SET qr_token = ?, qr_generated_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    newToken,
    new Date().toISOString(),
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ═══════════════════════════════════════════════════════════
//  MENU API
// ═══════════════════════════════════════════════════════════

// GET /menu — All items (with optional filters)
app.get('/menu', (req, res) => {
  let query = 'SELECT * FROM menu_items WHERE 1=1';
  const params = [];

  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }
  if (req.query.available !== undefined) {
    query += ' AND available = ?';
    params.push(Number(req.query.available));
  }

  query += ' ORDER BY category, sort_order, name';
  try {
    const items = db.prepare(query).all(...params);
    const enriched = items.map((item) => {
      const addons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?').all(item.id);
      return { ...item, addons };
    });
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve menu items' });
  }
});

// GET /menu/categories — Distinct categories
app.get('/menu/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM menu_items ORDER BY category').all();
  res.json(categories.map((c) => c.category));
});

// GET /menu/public — Public menu for QR self-order
app.get('/menu/public', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table number and token are required' });
  }

  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const config = readConfig();
  try {
    const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, sort_order, name').all();
    const enriched = items.map((item) => {
      const addons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?').all(item.id);
      return { ...item, addons };
    });
    res.json({
      restaurant: {
        id: RESTAURANT_ID,
        name: config.name,
        logo_url: config.logo_url || '',
        google_review_url: config.google_review_url || '',
        qr_theme: config.qr_theme || 'classic',
        billing_gst: config.billing_gst || { gst_enabled: true, gst_percent: 5, service_charge_enabled: false }
      },
      table: { id: tableRow.id, number: table, status: tableRow.status },
      menu: enriched,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load public menu' });
  }
});

// GET /menu/:id — Single item
app.get('/menu/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.json(item);
});

// POST /menu — Create item [ADMIN]
app.post('/menu', authMiddleware('admin'), (req, res) => {
  const { name, description, category, price, available = 1, image_placeholder, image_url } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const result = db
    .prepare(
      'INSERT INTO menu_items (name, description, category, price, available, image_placeholder, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(name, description || null, category, price, available, image_placeholder || null, image_url || null);

  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  io.to('restaurant').emit('menu:updated', {});
  res.status(201).json(item);
});

// PUT /menu/:id — Update item [ADMIN]
app.put('/menu/:id', authMiddleware('admin'), (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  const { name, description, category, price, available, image_placeholder, image_url } = req.body;

  db.prepare(
    `UPDATE menu_items SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      price = COALESCE(?, price),
      available = COALESCE(?, available),
      image_placeholder = COALESCE(?, image_placeholder),
      image_url = COALESCE(?, image_url)
    WHERE id = ?`
  ).run(
    name || null,
    description !== undefined ? description : null,
    category || null,
    price !== undefined ? price : null,
    available !== undefined ? available : null,
    image_placeholder !== undefined ? image_placeholder : null,
    image_url !== undefined ? image_url : null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  io.to('restaurant').emit('menu:updated', {});
  res.json(updated);
});

// DELETE /menu/:id — Delete item [ADMIN]
app.delete('/menu/:id', authMiddleware('admin'), (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  io.to('restaurant').emit('menu:updated', {});
  res.json({ message: 'Menu item deleted' });
});

// POST /menu/upload — Upload menu item custom image [ADMIN]
app.post('/menu/upload', authMiddleware('admin'), (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ error: 'Filename and base64Data are required' });
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const safeFilename = Date.now() + '-' + path.basename(filename);
    const targetPath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(targetPath, buffer);

    res.json({ url: `/r/${RESTAURANT_ID}/uploads/${safeFilename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save uploaded image' });
  }
});

// ═══════════════════════════════════════════════════════════
//  ORDERS API
// ═══════════════════════════════════════════════════════════

// Helper: get order with items
function getOrderWithItems(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  const parsedItems = items.map(item => {
    if (item.addons_json) {
      try {
        return { ...item, addons: JSON.parse(item.addons_json) };
      } catch (e) {
        return { ...item, addons: [] };
      }
    }
    return { ...item, addons: [] };
  });
  return { ...order, items: parsedItems };
}

function emitOrderUpdate(eventName, fullOrder) {
  if (!fullOrder) return;
  io.to('restaurant').emit(eventName, { order: fullOrder });
  if (fullOrder.table_number) {
    io.to(`table-${fullOrder.table_number}`).emit(eventName, { order: fullOrder });
  }
  if (fullOrder.customer_phone) {
    io.to(`customer-${fullOrder.customer_phone}`).emit(eventName, { order: fullOrder });
  }
}

// GET /orders — All orders with items
app.get('/orders', (req, res) => {
  let query = "SELECT * FROM orders WHERE 1=1";
  const params = [];

  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  if (req.query.table_id) {
    query += ' AND table_id = ?';
    params.push(Number(req.query.table_id));
  }
  if (req.query.date === 'today') {
    query += " AND DATE(created_at) = DATE('now', 'localtime')";
  } else if (req.query.date) {
    query += ' AND DATE(created_at) = ?';
    params.push(req.query.date);
  }

  query += ' ORDER BY created_at DESC';
  const orders = db.prepare(query).all(...params);

  const enriched = orders.map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json(enriched);
});

// GET /orders/active — Get active order by customer phone or table ID
app.get('/orders/active', (req, res) => {
  const { phone, table_id } = req.query;
  let activeOrder = null;

  if (phone) {
    activeOrder = db
      .prepare(
        "SELECT * FROM orders WHERE customer_phone = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
      )
      .get(phone);
  } else if (table_id) {
    activeOrder = db
      .prepare(
        "SELECT * FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
      )
      .get(Number(table_id));
  }

  if (!activeOrder) {
    return res.json({ order: null });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(activeOrder.id);
  res.json({ order: { ...activeOrder, items } });
});

// GET /orders/self — Self-order: get active order for table
app.get('/orders/self', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table number and token are required' });
  }

  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const activeOrder = db
    .prepare(
      "SELECT * FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(tableRow.id);

  if (!activeOrder) {
    return res.json({ order: null });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(activeOrder.id);
  res.json({ order: { ...activeOrder, items } });
});

// POST /orders/self — Self-order: create or add to order
app.post('/orders/self', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table number and token are required' });
  }

  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const { items, notes, customer_phone, customer_name } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  // Check for existing active order
  let order = db
    .prepare(
      "SELECT * FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(tableRow.id);

  const orderExists = !!order;

  const addItems = db.transaction(() => {
    if (!order) {
      // Create new order
      const result = db
        .prepare(
          "INSERT INTO orders (table_id, table_number, type, status, notes, customer_phone, customer_name, total) VALUES (?, ?, 'dine-in', 'pending', ?, ?, ?, 0)"
        )
        .run(tableRow.id, table, notes || null, customer_phone || null, customer_name || null);
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    } else {
      // Reset order status back to 'preparing' if it was already served/ready so it pops back into KDS
      if (order.status === 'served' || order.status === 'ready') {
        db.prepare("UPDATE orders SET status = 'preparing' WHERE id = ?").run(order.id);
      }
      // Update customer phone number if it wasn't recorded yet
      if (customer_phone && !order.customer_phone) {
        db.prepare("UPDATE orders SET customer_phone = ? WHERE id = ?").run(customer_phone, order.id);
      }
      // Update customer name if it wasn't recorded yet
      if (customer_name && !order.customer_name) {
        db.prepare("UPDATE orders SET customer_name = ? WHERE id = ?").run(customer_name, order.id);
      }
    }

    // Add items
    for (const item of items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.menu_item_id);
      if (!menuItem) continue;

      const qty = item.quantity || 1;
      let finalPrice = menuItem.price;
      let addonsJson = null;

      if (Array.isArray(item.addons) && item.addons.length > 0) {
        addonsJson = JSON.stringify(item.addons);
        const addonsTotal = item.addons.reduce((sum, ad) => sum + ad.price, 0);
        finalPrice += addonsTotal;
      }

      db.prepare(
        'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, notes, is_addon, addons_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(order.id, menuItem.id, menuItem.name, qty, finalPrice, item.notes || null, orderExists ? 1 : 0, addonsJson);
    }

    // Recalculate total
    const totalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(order.id);
    
    const discAmount = order ? (order.discount_amount || 0) : 0;
    const finalTotal = Math.max(0, (totalRow.total || 0) - discAmount);

    db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      finalTotal,
      order.id
    );
  });

  addItems();

  // Auto-print KOT on order placement
  const config = readConfig();
  if (config.printing?.auto_print?.on_kot_create) {
    console.log(`[Printer] AUTO-PRINT KOT: New Customer Self-Order placed for Table ${tableRow.number}. Print KOT to ${config.printing?.hardware?.kot_device || 'Default'}`);
  }

  const fullOrder = getOrderWithItems(order.id);
  updateTableStatus(tableRow.id);

  emitOrderUpdate('order:new', fullOrder);
  res.status(201).json(fullOrder);
});

// GET /orders/:id — Single order with items
app.get('/orders/:id', (req, res) => {
  const order = getOrderWithItems(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST /orders — Create order [STAFF]
app.post('/orders', authMiddleware('staff'), (req, res) => {
  const { table_id, table_number, type = 'dine-in', items, notes, customer_phone, customer_name, waiter_name, discount_amount = 0, coupon_code } = req.body;

  if (!table_id) {
    return res.status(400).json({ error: 'table_id is required' });
  }

  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(table_id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const tblNumber = table_number || table.number;

  const createOrder = db.transaction(() => {
    // Create order
    const result = db
      .prepare(
        'INSERT INTO orders (table_id, table_number, type, status, notes, customer_phone, customer_name, waiter_name, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(table_id, tblNumber, type, 'pending', notes || null, customer_phone || null, customer_name || null, waiter_name || null, 0);

    const orderId = result.lastInsertRowid;

    // Add items
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menu_item_id);
        if (!menuItem) continue;

        const qty = item.quantity || 1;
        let finalPrice = menuItem.price;
        let addonsJson = null;

        if (Array.isArray(item.addons) && item.addons.length > 0) {
          addonsJson = JSON.stringify(item.addons);
          const addonsTotal = item.addons.reduce((sum, ad) => sum + ad.price, 0);
          finalPrice += addonsTotal;
        }

        db.prepare(
          'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, notes, addons_json) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(orderId, menuItem.id, menuItem.name, qty, finalPrice, item.notes || null, addonsJson);
      }

      // Calculate total
      const totalRow = db
        .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
        .get(orderId);
      
      const discAmt = parseFloat(discount_amount) || 0;
      const finalTotal = Math.max(0, (totalRow.total || 0) - discAmt);

      db.prepare('UPDATE orders SET total = ?, discount_amount = ?, coupon_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        finalTotal,
        discAmt,
        coupon_code || null,
        orderId
      );
    }

    return orderId;
  });

  const orderId = createOrder();

  // Update table status
  updateTableStatus(table_id);

  // Auto-print KOT on order placement
  const config = readConfig();
  if (config.printing?.auto_print?.on_kot_create) {
    console.log(`[Printer] AUTO-PRINT KOT: New Staff Order placed for Table ${tblNumber} (Order #${orderId}). Print KOT to ${config.printing?.hardware?.kot_device || 'Default'}`);
  }

  const fullOrder = getOrderWithItems(orderId);
  emitOrderUpdate('order:new', fullOrder);

  res.status(201).json(fullOrder);
});

// PUT /orders/:id — Update order status [STAFF]
app.put('/orders/:id', authMiddleware('staff'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { status, notes } = req.body;

  if (status) {
    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      status,
      req.params.id
    );

    // Handle table status transitions
    if (order.table_id) {
      if (status === 'paid' || status === 'cancelled') {
        updateTableStatus(order.table_id);
      } else {
        updateTableStatus(order.table_id);
      }
    }
  }

  if (notes !== undefined) {
    db.prepare('UPDATE orders SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      notes,
      req.params.id
    );
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);

  res.json(fullOrder);
});

// DELETE /orders/:id — Cancel order [ADMIN]
app.delete('/orders/:id', authMiddleware('admin'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    req.params.id
  );

  if (order.table_id) {
    updateTableStatus(order.table_id);
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);
  res.json(fullOrder);
});

// POST /orders/:id/items — Add items to order [STAFF]
app.post('/orders/:id/items', authMiddleware('staff'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const addItems = db.transaction(() => {
    // Reset order status back to 'preparing' if it was already served/ready so it pops back into KDS
    if (order.status === 'served' || order.status === 'ready') {
      db.prepare("UPDATE orders SET status = 'preparing' WHERE id = ?").run(req.params.id);
    }

    for (const item of items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menu_item_id);
      if (!menuItem) continue;

      const qty = item.quantity || 1;
      let finalPrice = menuItem.price;
      let addonsJson = null;

      if (Array.isArray(item.addons) && item.addons.length > 0) {
        addonsJson = JSON.stringify(item.addons);
        const addonsTotal = item.addons.reduce((sum, ad) => sum + ad.price, 0);
        finalPrice += addonsTotal;
      }

      db.prepare(
        'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, notes, is_addon, addons_json) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
      ).run(req.params.id, menuItem.id, menuItem.name, qty, finalPrice, item.notes || null, addonsJson);
    }

    // Recalculate total
    const totalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(req.params.id);
    
    const discAmount = order.discount_amount || 0;
    const finalTotal = Math.max(0, (totalRow.total || 0) - discAmount);

    db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      finalTotal,
      req.params.id
    );
  });

  addItems();

  // Auto-print KOT on order item addition
  const config = readConfig();
  if (config.printing?.auto_print?.on_kot_create) {
    console.log(`[Printer] AUTO-PRINT KOT: Added items to Order #${req.params.id}. Print KOT to ${config.printing?.hardware?.kot_device || 'Default'}`);
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:itemAdded', fullOrder);
  res.json(fullOrder);
});

// PUT /orders/:id/items/:itemId — Update item status [STAFF]
app.put('/orders/:id/items/:itemId', authMiddleware('staff'), (req, res) => {
  const orderItem = db
    .prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?')
    .get(req.params.itemId, req.params.id);
  if (!orderItem) return res.status(404).json({ error: 'Order item not found' });

  const { status, quantity, notes } = req.body;

  if (status) {
    db.prepare('UPDATE order_items SET status = ? WHERE id = ?').run(status, req.params.itemId);
  }
  if (quantity !== undefined) {
    db.prepare('UPDATE order_items SET quantity = ? WHERE id = ?').run(quantity, req.params.itemId);
    // Recalculate total
    const totalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(req.params.id);
    db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      totalRow.total || 0,
      req.params.id
    );
  }
  if (notes !== undefined) {
    db.prepare('UPDATE order_items SET notes = ? WHERE id = ?').run(notes, req.params.itemId);
  }

  // Check if all items are ready → update order status
  if (status === 'ready') {
    const allItems = db.prepare('SELECT status FROM order_items WHERE order_id = ?').all(req.params.id);
    const allReady = allItems.every((i) => i.status === 'ready');
    if (allReady) {
      db.prepare("UPDATE orders SET status = 'ready', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        req.params.id
      );
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
      if (order && order.table_id) updateTableStatus(order.table_id);
    }
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);
  res.json(fullOrder);
});

// DELETE /orders/:id/items/:itemId — Remove item [STAFF]
app.delete('/orders/:id/items/:itemId', authMiddleware('staff'), (req, res) => {
  const orderItem = db
    .prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?')
    .get(req.params.itemId, req.params.id);
  if (!orderItem) return res.status(404).json({ error: 'Order item not found' });

  db.prepare('DELETE FROM order_items WHERE id = ?').run(req.params.itemId);

  // Recalculate total
  const totalRow = db
    .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
    .get(req.params.id);
  db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    totalRow.total || 0,
    req.params.id
  );

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);
  res.json(fullOrder);
});

// GET /orders/customer/:phone — Get customer historical orders
app.get('/orders/customer/:phone', (req, res) => {
  const phone = req.params.phone;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  const orders = db.prepare("SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC").all(phone);
  const enriched = orders.map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json(enriched);
});

// POST /orders/:id/pay-request — Customer requests checkout (payment pending)
app.post('/orders/:id/pay-request', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table and token are required' });
  }
  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND table_id = ?').get(req.params.id, tableRow.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { payment_method } = req.body;
  if (!payment_method) return res.status(400).json({ error: 'Payment method is required' });

  db.prepare(
    "UPDATE orders SET payment_status = 'pending_payment', payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(payment_method, req.params.id);

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);

  res.json(fullOrder);
});

// POST /orders/:id/settle — Settle billing / close order [STAFF]
app.post('/orders/:id/settle', authMiddleware('staff'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { payment_method, cash_amount, online_amount, discount_amount, coupon_code } = req.body;
  if (!payment_method) return res.status(400).json({ error: 'Payment method is required' });

  let cashAmt = 0;
  let onlineAmt = 0;
  let finalTotal = order.total;

  // Recalculate or apply discount/coupon if passed during settlement
  let discAmt = parseFloat(discount_amount) || 0;
  if (discAmt > 0 || coupon_code) {
    const itemsTotalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(req.params.id);
    const rawTotal = itemsTotalRow.total || 0;
    
    // Check if coupon is passed
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(coupon_code.trim().toUpperCase());
      if (coupon && rawTotal >= coupon.min_order_amount) {
        if (coupon.discount_type === 'percentage') {
          discAmt = (coupon.value / 100) * rawTotal;
        } else {
          discAmt = coupon.value;
        }
      }
    }
    
    finalTotal = Math.max(0, rawTotal - discAmt);
    db.prepare('UPDATE orders SET total = ?, discount_amount = ?, coupon_code = ? WHERE id = ?').run(
      finalTotal,
      discAmt,
      coupon_code || null,
      req.params.id
    );
  }

  if (payment_method === 'cash') {
    cashAmt = finalTotal;
    onlineAmt = 0;
  } else if (payment_method === 'upi' || payment_method === 'online') {
    cashAmt = 0;
    onlineAmt = finalTotal;
  } else if (payment_method === 'split') {
    cashAmt = parseFloat(cash_amount) || 0;
    onlineAmt = parseFloat(online_amount) || 0;

    // Validate that split matches final total
    if (Math.abs(cashAmt + onlineAmt - finalTotal) > 0.05) {
      return res.status(400).json({
        error: `Split amounts (Cash: ${cashAmt}, Online: ${onlineAmt}) must sum up to the total of ${finalTotal}`
      });
    }
  } else {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const settledBy = req.staffName || 'System';
  db.prepare(
    "UPDATE orders SET status = 'paid', payment_status = 'paid', payment_method = ?, cash_amount = ?, online_amount = ?, settled_by = ?, settled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(payment_method, cashAmt, onlineAmt, settledBy, req.params.id);

  if (order.table_id) {
    updateTableStatus(order.table_id);
  }

  // Auto-print receipt on settlement
  const config = readConfig();
  if (config.printing?.auto_print?.on_settlement) {
    console.log(`[Printer] AUTO-PRINT BILL: Order #${req.params.id} settled via ${payment_method}. Total: INR ${finalTotal}. Printing bill preview...`);
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);

  res.json(fullOrder);
});

// POST /orders/:id/send-whatsapp — Simulate sending WhatsApp message with bill link/receipt details
app.post('/orders/:id/send-whatsapp', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Customer phone number must be exactly 10 digits' });
  }

  // Update order's whatsapp_sent field
  db.prepare('UPDATE orders SET whatsapp_sent = 1 WHERE id = ?').run(req.params.id);

  console.log(`[WhatsApp Simulation] Sending bill for Order #${order.id} (Total: INR ${order.total}) to +91${phone}`);

  res.json({ message: `Bill sent to +91-${phone} successfully via WhatsApp Simulation.` });
});

// GET /settings/config — Get entire configuration including general, billing, and printing configs [STAFF/ADMIN]
app.get('/settings/config', authMiddleware('staff'), (req, res) => {
  const config = readConfig();
  res.json(config);
});

// PUT /settings/config — Update configuration including general, billing, and printing configs [ADMIN]
app.put('/settings/config', authMiddleware('admin'), (req, res) => {
  const config = readConfig();
  const { name, contact_phone, contact_email, location, fssai_compliance, billing, printing, google_review_url, qr_theme, logo_url } = req.body;

  if (name !== undefined) config.name = name;
  if (contact_phone !== undefined) {
    if (contact_phone && !/^\d{10}$/.test(contact_phone)) {
      return res.status(400).json({ error: 'Customer/Contact phone number must be exactly 10 digits' });
    }
    config.contact_phone = contact_phone;
  }
  if (contact_email !== undefined) config.contact_email = contact_email;
  if (location !== undefined) config.location = location;
  if (fssai_compliance !== undefined) config.fssai_compliance = fssai_compliance;
  if (billing !== undefined) config.billing = billing;
  if (printing !== undefined) config.printing = printing;
  if (google_review_url !== undefined) config.google_review_url = google_review_url;
  if (qr_theme !== undefined) config.qr_theme = qr_theme;
  if (logo_url !== undefined) config.logo_url = logo_url;

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  // Also sync with registry.json if necessary
  try {
    const agencyRegistryPath = path.join(__dirname, '..', '..', 'agency-core', 'registry.json');
    if (fs.existsSync(agencyRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(agencyRegistryPath, 'utf8'));
      const rIndex = reg.restaurants.findIndex(r => r.id === RESTAURANT_ID);
      if (rIndex !== -1) {
        reg.restaurants[rIndex].name = config.name || reg.restaurants[rIndex].name;
        reg.restaurants[rIndex].contact_phone = config.contact_phone || reg.restaurants[rIndex].contact_phone;
        reg.restaurants[rIndex].location = config.location || reg.restaurants[rIndex].location;
        reg.restaurants[rIndex].contact_email = config.contact_email || reg.restaurants[rIndex].contact_email;
        reg.restaurants[rIndex].logo_url = config.logo_url || reg.restaurants[rIndex].logo_url;
        fs.writeFileSync(agencyRegistryPath, JSON.stringify(reg, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.error('Failed to sync settings with agency registry:', e.message);
  }

  res.json({ message: 'Configuration updated successfully', config });
});

// GET /settings/upi-qr — Generates dynamic Base64 UPI QR code using the restaurant's UPI ID and details
app.get('/settings/upi-qr', (req, res) => {
  const config = readConfig();
  const upiId = req.query.upi_id || config.billing?.upi_id;
  const amount = req.query.amount;
  const merchantName = config.name || 'Restaurant';

  if (!upiId) {
    return res.status(400).json({ error: 'UPI ID is not configured' });
  }

  // Construct UPI URI
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR${amount ? `&am=${amount}` : ''}`;

  QRCode.toDataURL(upiUrl, (err, url) => {
    if (err) {
      console.error('Failed to generate UPI QR:', err.message);
      return res.status(500).json({ error: 'Failed to generate QR Code' });
    }
    res.json({ qr_base64: url, upi_url: upiUrl });
  });
});

// GET /coupons — Get all coupons [STAFF/ADMIN/PUBLIC]
app.get('/coupons', (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json(coupons);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /coupons — Create/Update a coupon [ADMIN]
app.post('/coupons', authMiddleware('admin'), (req, res) => {
  const { id, code, discount_type, value, min_order_amount, active } = req.body;
  if (!code || !discount_type || value === undefined) {
    return res.status(400).json({ error: 'code, discount_type, and value are required' });
  }

  try {
    if (id) {
      db.prepare(
        'UPDATE coupons SET code = ?, discount_type = ?, value = ?, min_order_amount = ?, active = ? WHERE id = ?'
      ).run(code.trim().toUpperCase(), discount_type, parseFloat(value), parseFloat(min_order_amount || 0), active ? 1 : 0, id);
      res.json({ message: 'Coupon updated successfully' });
    } else {
      db.prepare(
        'INSERT INTO coupons (code, discount_type, value, min_order_amount, active) VALUES (?, ?, ?, ?, ?)'
      ).run(code.trim().toUpperCase(), discount_type, parseFloat(value), parseFloat(min_order_amount || 0), active !== undefined ? (active ? 1 : 0) : 1);
      res.json({ message: 'Coupon created successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /coupons/:id — Delete coupon [ADMIN]
app.delete('/coupons/:id', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /coupons/validate — Validate a coupon for a given order amount
app.post('/coupons/validate', (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });
  if (amount === undefined) return res.status(400).json({ error: 'Order amount is required' });

  try {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.trim().toUpperCase());
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon' });
    }

    const orderAmt = parseFloat(amount);
    if (orderAmt < coupon.min_order_amount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of INR ${coupon.min_order_amount} is required to use this coupon`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (coupon.value / 100) * orderAmt;
    } else {
      discount = coupon.value;
    }

    // Discount cannot exceed total amount
    discount = Math.min(discount, orderAmt);

    res.json({
      valid: true,
      coupon,
      discount_amount: discount
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /menu/:id/addons — Retrieve all add-ons for a specific menu item
app.get('/menu/:id/addons', (req, res) => {
  try {
    const addons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?').all(req.params.id);
    res.json(addons);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /menu/:id/addons — Add/Update an add-on for a menu item [ADMIN]
app.post('/menu/:id/addons', authMiddleware('admin'), (req, res) => {
  const { id, name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  try {
    if (id) {
      db.prepare(
        'UPDATE menu_item_addons SET name = ?, price = ? WHERE id = ? AND menu_item_id = ?'
      ).run(name, parseFloat(price), id, req.params.id);
      res.json({ message: 'Add-on updated successfully' });
    } else {
      db.prepare(
        'INSERT INTO menu_item_addons (menu_item_id, name, price) VALUES (?, ?, ?)'
      ).run(req.params.id, name, parseFloat(price));
      res.json({ message: 'Add-on created successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /menu/:id/addons/:addonId — Delete an add-on [ADMIN]
app.delete('/menu/:id/addons/:addonId', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM menu_item_addons WHERE id = ? AND menu_item_id = ?').run(req.params.addonId, req.params.id);
    res.json({ message: 'Add-on deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /menu/reorder — Takes an array of { id, sort_order } to re-arrange menu listing [ADMIN]
app.put('/menu/reorder', authMiddleware('admin'), (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array of { id, sort_order }' });
  }

  const updateSort = db.transaction(() => {
    const stmt = db.prepare('UPDATE menu_items SET sort_order = ? WHERE id = ?');
    for (const item of items) {
      stmt.run(item.sort_order || 0, item.id);
    }
  });

  try {
    updateSort();
    res.json({ message: 'Menu items re-ordered successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  RESERVATIONS API
// ═══════════════════════════════════════════════════════════

// GET /reservations — All reservations with filters
app.get('/reservations', (req, res) => {
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];

  if (req.query.date) {
    query += ' AND reservation_date = ?';
    params.push(req.query.date);
  }
  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  if (req.query.table_id) {
    query += ' AND table_id = ?';
    params.push(Number(req.query.table_id));
  }

  query += ' ORDER BY reservation_date, reservation_time';
  const reservations = db.prepare(query).all(...params);
  res.json(reservations);
});

// GET /reservations/today — Today's reservations
app.get('/reservations/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const reservations = db
    .prepare(
      "SELECT * FROM reservations WHERE reservation_date = ? AND status != 'cancelled' ORDER BY reservation_time"
    )
    .all(today);
  res.json(reservations);
});

// GET /reservations/availability — Check available tables
app.get('/reservations/availability', (req, res) => {
  const { date, time, party_size } = req.query;

  if (!date || !time || !party_size) {
    return res.status(400).json({ error: 'date, time, and party_size are required' });
  }

  const size = Number(party_size);
  const [reqH, reqM] = time.split(':').map(Number);
  const requestedMinutes = reqH * 60 + reqM;

  // Get all tables with sufficient capacity
  const tables = db.prepare('SELECT * FROM tables WHERE capacity >= ? ORDER BY capacity').all(size);

  // Find tables not reserved at that time
  const available = tables.filter((table) => {
    const reservations = db
      .prepare(
        "SELECT reservation_time, duration_minutes FROM reservations WHERE table_id = ? AND reservation_date = ? AND status = 'confirmed'"
      )
      .all(table.id, date);

    // Check for time overlap
    for (const resv of reservations) {
      const [rH, rM] = resv.reservation_time.split(':').map(Number);
      const resvStart = rH * 60 + rM;
      const resvEnd = resvStart + (resv.duration_minutes || 90);
      const requestedEnd = requestedMinutes + 90;

      // Overlap check
      if (requestedMinutes < resvEnd && requestedEnd > resvStart) {
        return false;
      }
    }
    return true;
  });

  res.json(available);
});

// GET /reservations/:id — Single reservation
app.get('/reservations/:id', (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  res.json(reservation);
});

// POST /reservations — Create reservation
app.post('/reservations', (req, res) => {
  const {
    table_id,
    table_number,
    customer_name,
    customer_phone,
    customer_email,
    party_size,
    reservation_date,
    reservation_time,
    duration_minutes = 90,
    notes,
  } = req.body;

  if (!customer_name || !party_size || !reservation_date || !reservation_time) {
    return res
      .status(400)
      .json({ error: 'customer_name, party_size, reservation_date, and reservation_time are required' });
  }

  // Resolve table number if table_id provided
  let tblNumber = table_number;
  if (table_id && !tblNumber) {
    const table = db.prepare('SELECT number FROM tables WHERE id = ?').get(table_id);
    if (table) tblNumber = table.number;
  }

  const result = db
    .prepare(
      `INSERT INTO reservations (table_id, table_number, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      table_id || null,
      tblNumber || null,
      customer_name,
      customer_phone || null,
      customer_email || null,
      party_size,
      reservation_date,
      reservation_time,
      duration_minutes,
      notes || null
    );

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(result.lastInsertRowid);
  io.to('restaurant').emit('reservation:new', { reservation });

  // Update table status if applicable
  if (table_id) updateTableStatus(table_id);

  res.status(201).json(reservation);
});

// PUT /reservations/:id — Update reservation
app.put('/reservations/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reservation not found' });

  const {
    table_id,
    table_number,
    customer_name,
    customer_phone,
    customer_email,
    party_size,
    reservation_date,
    reservation_time,
    duration_minutes,
    status,
    notes,
  } = req.body;

  db.prepare(
    `UPDATE reservations SET
      table_id = COALESCE(?, table_id),
      table_number = COALESCE(?, table_number),
      customer_name = COALESCE(?, customer_name),
      customer_phone = COALESCE(?, customer_phone),
      customer_email = COALESCE(?, customer_email),
      party_size = COALESCE(?, party_size),
      reservation_date = COALESCE(?, reservation_date),
      reservation_time = COALESCE(?, reservation_time),
      duration_minutes = COALESCE(?, duration_minutes),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes)
    WHERE id = ?`
  ).run(
    table_id || null,
    table_number || null,
    customer_name || null,
    customer_phone || null,
    customer_email || null,
    party_size || null,
    reservation_date || null,
    reservation_time || null,
    duration_minutes || null,
    status || null,
    notes || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  io.to('restaurant').emit('reservation:updated', { reservation: updated });

  // Update relevant table statuses
  if (existing.table_id) updateTableStatus(existing.table_id);
  if (table_id && table_id !== existing.table_id) updateTableStatus(table_id);

  res.json(updated);
});

// DELETE /reservations/:id — Cancel reservation
app.delete('/reservations/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reservation not found' });

  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(req.params.id);

  io.to('restaurant').emit('reservation:cancelled', { reservationId: Number(req.params.id) });

  if (existing.table_id) updateTableStatus(existing.table_id);

  res.json({ message: 'Reservation cancelled' });
});

// ═══════════════════════════════════════════════════════════
//  ANALYTICS API [ADMIN]
// ═══════════════════════════════════════════════════════════

// GET /analytics/summary — Today's summary
app.get('/analytics/summary', (req, res) => {
  const todayRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const todayCashRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(cash_amount), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const todayOnlineRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(online_amount), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const todayOrders = db
    .prepare(
      "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now', 'localtime') AND status != 'cancelled'"
    )
    .get();

  const avgOrderValue = db
    .prepare(
      "SELECT COALESCE(AVG(total), 0) as avg FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const paidOrders = db
    .prepare(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const totalTables = db.prepare('SELECT COUNT(*) as count FROM tables').get();

  const tableTurnover =
    totalTables.count > 0 ? Math.round((paidOrders.count / totalTables.count) * 100) / 100 : 0;

  res.json({
    revenue: Math.round(todayRevenue.revenue * 100) / 100,
    cashRevenue: Math.round(todayCashRevenue.revenue * 100) / 100,
    onlineRevenue: Math.round(todayOnlineRevenue.revenue * 100) / 100,
    orderCount: todayOrders.count,
    avgOrderValue: Math.round(avgOrderValue.avg * 100) / 100,
    tableTurnover,
    paidOrders: paidOrders.count,
    totalTables: totalTables.count,
  });
});

// GET /analytics/revenue — Daily revenue breakdown
app.get('/analytics/revenue', (req, res) => {
  const period = req.query.period || 'week';
  let days = period === 'month' ? 30 : 7;

  const rows = db
    .prepare(
      `SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(cash_amount), 0) as cash_revenue, COALESCE(SUM(online_amount), 0) as online_revenue, COUNT(*) as orders
       FROM orders
       WHERE status = 'paid' AND created_at >= DATE('now', 'localtime', '-${days} days')
       GROUP BY DATE(created_at)
       ORDER BY date`
    )
    .all();

  res.json(rows.map(row => ({
    date: row.date,
    revenue: Math.round(row.revenue * 100) / 100,
    cash_revenue: Math.round(row.cash_revenue * 100) / 100,
    online_revenue: Math.round(row.online_revenue * 100) / 100,
    orders: row.orders
  })));
});

// GET /analytics/popular — Top 5 most ordered items
app.get('/analytics/popular', (req, res) => {
  const items = db
    .prepare(
      `SELECT item_name, SUM(quantity) as total_ordered, COUNT(DISTINCT order_id) as order_count
       FROM order_items
       GROUP BY item_name
       ORDER BY total_ordered DESC
       LIMIT 5`
    )
    .all();

  res.json(items);
});

// GET /analytics/money — Money management collections breakdown [ADMIN]
app.get('/analytics/money', authMiddleware('admin'), (req, res) => {
  const { startDate, endDate } = req.query;
  let query = "SELECT id, total, cash_amount, online_amount, payment_method, settled_by, settled_at, customer_name, customer_phone, table_number FROM orders WHERE status = 'paid'";
  const params = [];

  if (startDate) {
    query += " AND DATE(settled_at) >= DATE(?)";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND DATE(settled_at) <= DATE(?)";
    params.push(endDate);
  }

  query += " ORDER BY settled_at DESC";

  try {
    const orders = db.prepare(query).all(...params);
    
    let totalCollected = 0;
    let totalCash = 0;
    let totalOnline = 0;
    const staffAttribution = {};

    orders.forEach(order => {
      const total = order.total || 0;
      const cash = order.cash_amount || 0;
      const online = order.online_amount || 0;
      const staff = order.settled_by || 'System';

      totalCollected += total;
      totalCash += cash;
      totalOnline += online;

      if (!staffAttribution[staff]) {
        staffAttribution[staff] = { cash: 0, online: 0, total: 0, ordersCount: 0 };
      }
      staffAttribution[staff].cash += cash;
      staffAttribution[staff].online += online;
      staffAttribution[staff].total += total;
      staffAttribution[staff].ordersCount += 1;
    });

    res.json({
      orders,
      totals: {
        totalCollected,
        totalCash,
        totalOnline
      },
      staffAttribution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve money analytics' });
  }
});

// POST /orders/delete-history — Delete orders in date range [ADMIN/CASHIER]
app.post('/orders/delete-history', authMiddleware('staff'), (req, res) => {
  const role = req.role;
  if (role !== 'admin' && role !== 'cashier') {
    return res.status(403).json({ error: 'Admin or Cashier privilege required' });
  }

  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  try {
    const ordersToDelete = db
      .prepare("SELECT id FROM orders WHERE DATE(COALESCE(settled_at, updated_at, created_at)) >= DATE(?) AND DATE(COALESCE(settled_at, updated_at, created_at)) <= DATE(?)")
      .all(startDate, endDate);
    const orderIds = ordersToDelete.map(o => o.id);

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM order_items WHERE order_id IN (${placeholders})`).run(...orderIds);
      db.prepare(`DELETE FROM orders WHERE id IN (${placeholders})`).run(...orderIds);
    }

    res.json({ message: `Successfully deleted ${orderIds.length} orders in range [${startDate} - ${endDate}].` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction history' });
  }
});

// ═══════════════════════════════════════════════════════════
//  SOCKET.IO
// ═══════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  // Join restaurant room
  socket.join('restaurant');

  // Send snapshot of all table statuses
  const tables = db.prepare('SELECT id, number, status, section FROM tables ORDER BY section, number').all();
  socket.emit('snapshot', { tables });

  // Join specific table room
  socket.on('join-table', (tableNumber) => {
    socket.join(`table-${tableNumber}`);
  });

  // Join specific customer room
  socket.on('join-customer', (phone) => {
    if (phone) {
      socket.join(`customer-${phone}`);
    }
  });

  // Waiter call
  socket.on('waiter:call', (data) => {
    io.to('restaurant').emit('waiter:called', {
      table: data.table || data.tableNumber,
      tableNumber: data.tableNumber || data.table,
      timestamp: new Date().toISOString(),
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  SCHEDULED TASKS
// ═══════════════════════════════════════════════════════════

// Reservation reminder — every 60 seconds
setInterval(() => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const reservations = db
      .prepare(
        "SELECT * FROM reservations WHERE reservation_date = ? AND status = 'confirmed'"
      )
      .all(today);

    for (const resv of reservations) {
      const [h, m] = resv.reservation_time.split(':').map(Number);
      const resvMinutes = h * 60 + m;
      const diff = resvMinutes - currentMinutes;

      // Within 15 minutes (±1 minute window)
      if (diff >= 14 && diff <= 16) {
        io.to('restaurant').emit('reservation:reminder', { reservation: resv });
      }
    }
  } catch (err) {
    // Silent fail for background tasks
  }
}, 60000);

// Reservation status check — every 5 minutes
setInterval(() => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const reservations = db
      .prepare(
        "SELECT * FROM reservations WHERE reservation_date = ? AND status = 'confirmed'"
      )
      .all(today);

    for (const resv of reservations) {
      if (!resv.table_id) continue;

      const [h, m] = resv.reservation_time.split(':').map(Number);
      const resvMinutes = h * 60 + m;
      const diff = resvMinutes - currentMinutes;

      // Within 60 minutes
      if (diff > 0 && diff <= 60) {
        const table = db.prepare('SELECT status FROM tables WHERE id = ?').get(resv.table_id);
        if (table && table.status === 'available') {
          db.prepare("UPDATE tables SET status = 'reserved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
            resv.table_id
          );
          io.to('restaurant').emit('table:statusChanged', {
            tableId: resv.table_id,
            status: 'reserved',
          });
        }
      }
    }
  } catch (err) {
    // Silent fail for background tasks
  }
}, 300000);

// ─── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  const config = readConfig();
  console.log(`  🍽️  Restaurant ${RESTAURANT_ID} (${config.name}) running on port ${PORT}`);
});
