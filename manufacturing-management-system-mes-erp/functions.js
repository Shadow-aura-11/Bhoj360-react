
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for manufacturing-management-system-mes-erp at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS raw_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS production_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);


function getSetting(key) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  return stmt.get(key);
}

function setSetting(key, value) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  stmt.run(key, value);
}

// CRUD for products
function createProduct(data) {
  const stmt = db.prepare('INSERT INTO products (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getProduct(id) {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
}

function updateProduct(id, data) {
  const stmt = db.prepare('UPDATE products SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteProduct(id) {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
}

function listProducts() {
  const stmt = db.prepare('SELECT * FROM products');
  return stmt.all();
}

// CRUD for raw_materials
function createRaw_material(data) {
  const stmt = db.prepare('INSERT INTO raw_materials (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getRaw_material(id) {
  const stmt = db.prepare('SELECT * FROM raw_materials WHERE id = ?');
  return stmt.get(id);
}

function updateRaw_material(id, data) {
  const stmt = db.prepare('UPDATE raw_materials SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteRaw_material(id) {
  const stmt = db.prepare('DELETE FROM raw_materials WHERE id = ?');
  stmt.run(id);
}

function listRaw_materials() {
  const stmt = db.prepare('SELECT * FROM raw_materials');
  return stmt.all();
}

// CRUD for production_orders
function createProduction_order(data) {
  const stmt = db.prepare('INSERT INTO production_orders (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getProduction_order(id) {
  const stmt = db.prepare('SELECT * FROM production_orders WHERE id = ?');
  return stmt.get(id);
}

function updateProduction_order(id, data) {
  const stmt = db.prepare('UPDATE production_orders SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteProduction_order(id) {
  const stmt = db.prepare('DELETE FROM production_orders WHERE id = ?');
  stmt.run(id);
}

function listProduction_orders() {
  const stmt = db.prepare('SELECT * FROM production_orders');
  return stmt.all();
}

// CRUD for inventory
function createInventory(data) {
  const stmt = db.prepare('INSERT INTO inventory (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getInventory(id) {
  const stmt = db.prepare('SELECT * FROM inventory WHERE id = ?');
  return stmt.get(id);
}

function updateInventory(id, data) {
  const stmt = db.prepare('UPDATE inventory SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteInventory(id) {
  const stmt = db.prepare('DELETE FROM inventory WHERE id = ?');
  stmt.run(id);
}

function listInventory() {
  const stmt = db.prepare('SELECT * FROM inventory');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  createRaw_material,
  getRaw_material,
  updateRaw_material,
  deleteRaw_material,
  listRaw_materials,
  createProduction_order,
  getProduction_order,
  updateProduction_order,
  deleteProduction_order,
  listProduction_orders,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  listInventory
};
