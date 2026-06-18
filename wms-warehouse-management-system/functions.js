
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for wms-warehouse-management-system at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS receipts (
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

// CRUD for items
function createItem(data) {
  const stmt = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getItem(id) {
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  return stmt.get(id);
}

function updateItem(id, data) {
  const stmt = db.prepare('UPDATE items SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteItem(id) {
  const stmt = db.prepare('DELETE FROM items WHERE id = ?');
  stmt.run(id);
}

function listItems() {
  const stmt = db.prepare('SELECT * FROM items');
  return stmt.all();
}

// CRUD for bins
function createBin(data) {
  const stmt = db.prepare('INSERT INTO bins (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getBin(id) {
  const stmt = db.prepare('SELECT * FROM bins WHERE id = ?');
  return stmt.get(id);
}

function updateBin(id, data) {
  const stmt = db.prepare('UPDATE bins SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteBin(id) {
  const stmt = db.prepare('DELETE FROM bins WHERE id = ?');
  stmt.run(id);
}

function listBins() {
  const stmt = db.prepare('SELECT * FROM bins');
  return stmt.all();
}

// CRUD for shipments
function createShipment(data) {
  const stmt = db.prepare('INSERT INTO shipments (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getShipment(id) {
  const stmt = db.prepare('SELECT * FROM shipments WHERE id = ?');
  return stmt.get(id);
}

function updateShipment(id, data) {
  const stmt = db.prepare('UPDATE shipments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteShipment(id) {
  const stmt = db.prepare('DELETE FROM shipments WHERE id = ?');
  stmt.run(id);
}

function listShipments() {
  const stmt = db.prepare('SELECT * FROM shipments');
  return stmt.all();
}

// CRUD for receipts
function createReceipt(data) {
  const stmt = db.prepare('INSERT INTO receipts (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getReceipt(id) {
  const stmt = db.prepare('SELECT * FROM receipts WHERE id = ?');
  return stmt.get(id);
}

function updateReceipt(id, data) {
  const stmt = db.prepare('UPDATE receipts SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteReceipt(id) {
  const stmt = db.prepare('DELETE FROM receipts WHERE id = ?');
  stmt.run(id);
}

function listReceipts() {
  const stmt = db.prepare('SELECT * FROM receipts');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createItem,
  getItem,
  updateItem,
  deleteItem,
  listItems,
  createBin,
  getBin,
  updateBin,
  deleteBin,
  listBins,
  createShipment,
  getShipment,
  updateShipment,
  deleteShipment,
  listShipments,
  createReceipt,
  getReceipt,
  updateReceipt,
  deleteReceipt,
  listReceipts
};
