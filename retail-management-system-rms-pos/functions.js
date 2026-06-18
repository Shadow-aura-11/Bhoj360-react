
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for retail-management-system-rms-pos at ' + dbPath);

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

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
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

// CRUD for sales
function createSale(data) {
  const stmt = db.prepare('INSERT INTO sales (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getSale(id) {
  const stmt = db.prepare('SELECT * FROM sales WHERE id = ?');
  return stmt.get(id);
}

function updateSale(id, data) {
  const stmt = db.prepare('UPDATE sales SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteSale(id) {
  const stmt = db.prepare('DELETE FROM sales WHERE id = ?');
  stmt.run(id);
}

function listSales() {
  const stmt = db.prepare('SELECT * FROM sales');
  return stmt.all();
}

// CRUD for customers
function createCustomer(data) {
  const stmt = db.prepare('INSERT INTO customers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getCustomer(id) {
  const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
  return stmt.get(id);
}

function updateCustomer(id, data) {
  const stmt = db.prepare('UPDATE customers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteCustomer(id) {
  const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
  stmt.run(id);
}

function listCustomers() {
  const stmt = db.prepare('SELECT * FROM customers');
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
  createSale,
  getSale,
  updateSale,
  deleteSale,
  listSales,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomers,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  listInventory
};
