
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for real-estate-management-system-rems at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS buyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
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

// CRUD for properties
function createPropertie(data) {
  const stmt = db.prepare('INSERT INTO properties (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getPropertie(id) {
  const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
  return stmt.get(id);
}

function updatePropertie(id, data) {
  const stmt = db.prepare('UPDATE properties SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deletePropertie(id) {
  const stmt = db.prepare('DELETE FROM properties WHERE id = ?');
  stmt.run(id);
}

function listProperties() {
  const stmt = db.prepare('SELECT * FROM properties');
  return stmt.all();
}

// CRUD for buyers
function createBuyer(data) {
  const stmt = db.prepare('INSERT INTO buyers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getBuyer(id) {
  const stmt = db.prepare('SELECT * FROM buyers WHERE id = ?');
  return stmt.get(id);
}

function updateBuyer(id, data) {
  const stmt = db.prepare('UPDATE buyers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteBuyer(id) {
  const stmt = db.prepare('DELETE FROM buyers WHERE id = ?');
  stmt.run(id);
}

function listBuyers() {
  const stmt = db.prepare('SELECT * FROM buyers');
  return stmt.all();
}

// CRUD for agents
function createAgent(data) {
  const stmt = db.prepare('INSERT INTO agents (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getAgent(id) {
  const stmt = db.prepare('SELECT * FROM agents WHERE id = ?');
  return stmt.get(id);
}

function updateAgent(id, data) {
  const stmt = db.prepare('UPDATE agents SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteAgent(id) {
  const stmt = db.prepare('DELETE FROM agents WHERE id = ?');
  stmt.run(id);
}

function listAgents() {
  const stmt = db.prepare('SELECT * FROM agents');
  return stmt.all();
}

// CRUD for transactions
function createTransaction(data) {
  const stmt = db.prepare('INSERT INTO transactions (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getTransaction(id) {
  const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
  return stmt.get(id);
}

function updateTransaction(id, data) {
  const stmt = db.prepare('UPDATE transactions SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteTransaction(id) {
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  stmt.run(id);
}

function listTransactions() {
  const stmt = db.prepare('SELECT * FROM transactions');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createPropertie,
  getPropertie,
  updatePropertie,
  deletePropertie,
  listProperties,
  createBuyer,
  getBuyer,
  updateBuyer,
  deleteBuyer,
  listBuyers,
  createAgent,
  getAgent,
  updateAgent,
  deleteAgent,
  listAgents,
  createTransaction,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  listTransactions
};
