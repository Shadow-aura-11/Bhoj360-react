
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for property-management-system-pms at ' + dbPath);

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

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS maintenance_requests (
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

// CRUD for tenants
function createTenant(data) {
  const stmt = db.prepare('INSERT INTO tenants (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getTenant(id) {
  const stmt = db.prepare('SELECT * FROM tenants WHERE id = ?');
  return stmt.get(id);
}

function updateTenant(id, data) {
  const stmt = db.prepare('UPDATE tenants SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteTenant(id) {
  const stmt = db.prepare('DELETE FROM tenants WHERE id = ?');
  stmt.run(id);
}

function listTenants() {
  const stmt = db.prepare('SELECT * FROM tenants');
  return stmt.all();
}

// CRUD for leases
function createLease(data) {
  const stmt = db.prepare('INSERT INTO leases (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getLease(id) {
  const stmt = db.prepare('SELECT * FROM leases WHERE id = ?');
  return stmt.get(id);
}

function updateLease(id, data) {
  const stmt = db.prepare('UPDATE leases SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteLease(id) {
  const stmt = db.prepare('DELETE FROM leases WHERE id = ?');
  stmt.run(id);
}

function listLeases() {
  const stmt = db.prepare('SELECT * FROM leases');
  return stmt.all();
}

// CRUD for maintenance_requests
function createMaintenance_request(data) {
  const stmt = db.prepare('INSERT INTO maintenance_requests (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getMaintenance_request(id) {
  const stmt = db.prepare('SELECT * FROM maintenance_requests WHERE id = ?');
  return stmt.get(id);
}

function updateMaintenance_request(id, data) {
  const stmt = db.prepare('UPDATE maintenance_requests SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteMaintenance_request(id) {
  const stmt = db.prepare('DELETE FROM maintenance_requests WHERE id = ?');
  stmt.run(id);
}

function listMaintenance_requests() {
  const stmt = db.prepare('SELECT * FROM maintenance_requests');
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
  createTenant,
  getTenant,
  updateTenant,
  deleteTenant,
  listTenants,
  createLease,
  getLease,
  updateLease,
  deleteLease,
  listLeases,
  createMaintenance_request,
  getMaintenance_request,
  updateMaintenance_request,
  deleteMaintenance_request,
  listMaintenance_requests
};
