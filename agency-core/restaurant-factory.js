/**
 * Restaurant Factory — Creates new restaurant microservices.
 * Generates unique ID, assigns port, initialises database, seeds data,
 * copies the service template, and spawns the microservice process.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const RESTAURANTS_DIR = path.join(__dirname, '..', 'restaurants');
const TEMPLATE_PATH = path.join(__dirname, 'service-template.js');
const BASE_PORT = 3100;
const QR_SECRET_SALT = process.env.QR_SECRET_SALT || 'change-this-in-production';

// ─── Helpers ────────────────────────────────────────────────

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { restaurants: [] };
  }
}

function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `REST-${id}`;
}

function generateQrToken(restaurantId, tableNumber) {
  return crypto
    .createHash('sha256')
    .update(restaurantId + tableNumber + QR_SECRET_SALT)
    .digest('hex');
}

// ─── Main Factory Function ──────────────────────────────────

async function createRestaurant(options = {}) {
  const registry = readRegistry();

  // 1. Generate unique ID
  let id;
  const existingIds = new Set(registry.restaurants.map((r) => r.id));
  do {
    id = generateId();
  } while (existingIds.has(id));

  // 2. Auto-assign port
  let port = BASE_PORT;
  if (registry.restaurants.length > 0) {
    const maxPort = Math.max(...registry.restaurants.map((r) => r.port));
    port = maxPort + 1;
  }

  // 3. Create directory
  const restaurantDir = path.join(RESTAURANTS_DIR, id);
  fs.mkdirSync(restaurantDir, { recursive: true });

  // 4. Create config.json
  const name = options.name || 'Unnamed Restaurant';
  const tableCount = options.tableCount || 8;
  const logo_url = options.logo_url || '';
  const description = options.description || '';
  const logout_redirect_url = options.logout_redirect_url || '';
  const login_theme_color = options.login_theme_color || '#fafaf9';
  const location = options.location || '';
  const contact_email = options.contact_email || '';
  const contact_phone = options.contact_phone || '';

  const subscription = {
    planName: 'Bronze Plan',
    price: 999,
    billingCycle: 'Monthly',
    status: 'Trial',
    startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  const paymentHistory = [];

  const config = {
    id,
    name,
    port,
    createdAt: new Date().toISOString(),
    active: true,
    logo_url,
    description,
    logout_redirect_url,
    login_theme_color,
    location,
    contact_email,
    contact_phone,
    subscription,
    paymentHistory,
    pins: {
      admin: options.pins?.admin || 'admin123',
      waiter: options.pins?.waiter || '2222',
      counter: options.pins?.counter || '3333',
      cashier: options.pins?.cashier || '4444',
      customer: options.pins?.customer || '0000',
    },
  };

  fs.writeFileSync(
    path.join(restaurantDir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );

  // 5. Create and initialise database
  const dbPath = path.join(restaurantDir, 'db.sqlite');
  const db = new Database(dbPath);

  // Enable WAL for better concurrency
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL DEFAULT 4,
      section TEXT DEFAULT 'Main',
      status TEXT DEFAULT 'available',
      qr_token TEXT,
      qr_generated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      available INTEGER DEFAULT 1,
      image_placeholder TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_item_addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL, -- 'percentage' or 'flat'
      value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER REFERENCES tables(id),
      table_number TEXT,
      type TEXT DEFAULT 'dine-in',
      status TEXT DEFAULT 'pending',
      notes TEXT,
      total REAL DEFAULT 0,
      customer_phone TEXT,
      customer_name TEXT,
      waiter_name TEXT,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'unpaid',
      cash_amount REAL DEFAULT 0,
      online_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      coupon_code TEXT,
      whatsapp_sent INTEGER DEFAULT 0,
      settled_by TEXT DEFAULT 'System',
      settled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      menu_item_id INTEGER REFERENCES menu_items(id),
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      is_addon INTEGER DEFAULT 0,
      addons_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER REFERENCES tables(id),
      table_number TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_email TEXT,
      party_size INTEGER NOT NULL,
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      duration_minutes INTEGER DEFAULT 90,
      status TEXT DEFAULT 'confirmed',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed menu items (16 items across 4 categories)
  const menuInsert = db.prepare(
    'INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const menuItems = [
    // Starters
    ['Garlic Bread', 'Crispy bread with garlic butter and herbs', 'Starters', 120, '🧄🍞', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400'],
    ['Soup of the Day', 'Chef\'s special soup served with croutons', 'Starters', 150, '🍲', 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=400'],
    ['Spring Rolls', 'Crispy vegetable spring rolls with sweet chili sauce', 'Starters', 160, '🥟', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'],
    ['Bruschetta', 'Toasted bread topped with tomatoes, basil, and olive oil', 'Starters', 140, '🍅', 'https://images.unsplash.com/photo-1572448868306-1810ea24c46f?w=400'],
    // Mains
    ['Grilled Chicken', 'Herb-marinated chicken breast with seasonal vegetables', 'Mains', 380, '🍗', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400'],
    ['Pasta Arrabiata', 'Penne in spicy tomato sauce with fresh basil', 'Mains', 290, '🍝', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'],
    ['Paneer Tikka', 'Tandoor-grilled cottage cheese with mint chutney', 'Mains', 320, '🧀', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400'],
    ['Fish & Chips', 'Beer-battered fish with crispy fries and tartar sauce', 'Mains', 420, '🐟', 'https://images.unsplash.com/photo-1582236968798-e7e0e7a17726?w=400'],
    ['Veg Biryani', 'Fragrant basmati rice with mixed vegetables and raita', 'Mains', 280, '🍚', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400'],
    // Drinks
    ['Fresh Lime Soda', 'Freshly squeezed lime with soda water', 'Drinks', 80, '🍋', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400'],
    ['Mango Lassi', 'Creamy yogurt smoothie with fresh mango pulp', 'Drinks', 110, '🥭', 'https://images.unsplash.com/photo-1571006682862-3936b2884a57?w=400'],
    ['Cold Coffee', 'Chilled coffee blended with ice cream', 'Drinks', 130, '☕', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400'],
    ['Mineral Water', 'Premium bottled mineral water', 'Drinks', 40, '💧', 'https://images.unsplash.com/photo-1608885898957-a599fb18de37?w=400'],
    // Desserts
    ['Chocolate Lava Cake', 'Warm chocolate cake with molten center and vanilla ice cream', 'Desserts', 220, '🍫', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    ['Gulab Jamun', 'Soft milk dumplings in warm rose-scented syrup', 'Desserts', 120, '🍯', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400'],
    ['Ice Cream (2 scoops)', 'Choice of vanilla, chocolate, or strawberry', 'Desserts', 160, '🍨', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'],
  ];

  const seedMenu = db.transaction(() => {
    for (const item of menuItems) {
      menuInsert.run(...item);
    }
  });
  seedMenu();

  // Seed tables based on tableCount
  const tableInsert = db.prepare(
    'INSERT INTO tables (number, capacity, section, qr_token, qr_generated_at) VALUES (?, ?, ?, ?, ?)'
  );

  const indoorCount = Math.ceil(tableCount / 3);
  const outdoorCount = Math.ceil(tableCount / 3);
  const vipCount = tableCount - indoorCount - outdoorCount;

  const seedTables = db.transaction(() => {
    // Indoor tables
    for (let i = 1; i <= indoorCount; i++) {
      const number = `T${i}`;
      const token = generateQrToken(id, number);
      tableInsert.run(number, 4, 'Indoor', token, new Date().toISOString());
    }
    // Outdoor tables
    for (let i = 1; i <= outdoorCount; i++) {
      const number = `O${i}`;
      const token = generateQrToken(id, number);
      tableInsert.run(number, 4, 'Outdoor', token, new Date().toISOString());
    }
    // VIP tables
    for (let i = 1; i <= vipCount; i++) {
      const number = `VIP-${i}`;
      const token = generateQrToken(id, number);
      tableInsert.run(number, 6, 'VIP', token, new Date().toISOString());
    }
  });
  seedTables();

  // Seed 3 sample reservations for today
  const today = new Date().toISOString().split('T')[0];
  const reservationInsert = db.prepare(
    'INSERT INTO reservations (table_id, table_number, customer_name, customer_phone, party_size, reservation_date, reservation_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const seedReservations = db.transaction(() => {
    reservationInsert.run(1, 'T1', 'Rahul Sharma', '+91-9876543210', 2, today, '13:00', 'confirmed', 'Window seat preferred');
    reservationInsert.run(2, 'T2', 'Priya Patel', '+91-9876543211', 4, today, '19:00', 'confirmed', 'Birthday celebration');
    reservationInsert.run(3, 'T3', 'Amit Kumar', '+91-9876543212', 6, today, '20:30', 'confirmed', 'Business dinner');
  });
  seedReservations();

  db.close();

  // 6. Copy service template and inject config
  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Inject restaurant-specific constants at the top
  const injection = `const RESTAURANT_ID = '${id}';\nconst PORT = ${port};\n`;
  template = injection + template;

  const servicePath = path.join(restaurantDir, 'service.js');
  fs.writeFileSync(servicePath, template, 'utf8');

  // 7. Update registry
  registry.restaurants.push({
    id,
    name,
    port,
    active: true,
    logo_url,
    description,
    logout_redirect_url,
    login_theme_color,
    location,
    contact_email,
    contact_phone,
    subscription,
    paymentHistory
  });
  writeRegistry(registry);

  // 8. Spawn the microservice
  try {
    const child = spawn('node', [servicePath], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') },
    });
    child.unref();
    console.log(`  [Factory] ✓ Restaurant ${id} (${name}) created and running on port ${port}`);
  } catch (err) {
    console.error(`  [Factory] ✗ Created ${id} but failed to start: ${err.message}`);
  }

  // 9. Return config
  return config;
}

module.exports = { createRestaurant };
