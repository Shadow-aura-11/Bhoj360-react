
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for logistics-transportation-management-system-lms-tms at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS routes (
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

// CRUD for vehicles
function createVehicle(data) {
  const stmt = db.prepare('INSERT INTO vehicles (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getVehicle(id) {
  const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
  return stmt.get(id);
}

function updateVehicle(id, data) {
  const stmt = db.prepare('UPDATE vehicles SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteVehicle(id) {
  const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
  stmt.run(id);
}

function listVehicles() {
  const stmt = db.prepare('SELECT * FROM vehicles');
  return stmt.all();
}

// CRUD for drivers
function createDriver(data) {
  const stmt = db.prepare('INSERT INTO drivers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getDriver(id) {
  const stmt = db.prepare('SELECT * FROM drivers WHERE id = ?');
  return stmt.get(id);
}

function updateDriver(id, data) {
  const stmt = db.prepare('UPDATE drivers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteDriver(id) {
  const stmt = db.prepare('DELETE FROM drivers WHERE id = ?');
  stmt.run(id);
}

function listDrivers() {
  const stmt = db.prepare('SELECT * FROM drivers');
  return stmt.all();
}

// CRUD for routes
function createRoute(data) {
  const stmt = db.prepare('INSERT INTO routes (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getRoute(id) {
  const stmt = db.prepare('SELECT * FROM routes WHERE id = ?');
  return stmt.get(id);
}

function updateRoute(id, data) {
  const stmt = db.prepare('UPDATE routes SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteRoute(id) {
  const stmt = db.prepare('DELETE FROM routes WHERE id = ?');
  stmt.run(id);
}

function listRoutes() {
  const stmt = db.prepare('SELECT * FROM routes');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createShipment,
  getShipment,
  updateShipment,
  deleteShipment,
  listShipments,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  listVehicles,
  createDriver,
  getDriver,
  updateDriver,
  deleteDriver,
  listDrivers,
  createRoute,
  getRoute,
  updateRoute,
  deleteRoute,
  listRoutes
};
