
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for spa-wellness-management-system at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
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
`);


function getSetting(key) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  return stmt.get(key);
}

function setSetting(key, value) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  stmt.run(key, value);
}

// CRUD for services
function createService(data) {
  const stmt = db.prepare('INSERT INTO services (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getService(id) {
  const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
  return stmt.get(id);
}

function updateService(id, data) {
  const stmt = db.prepare('UPDATE services SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteService(id) {
  const stmt = db.prepare('DELETE FROM services WHERE id = ?');
  stmt.run(id);
}

function listServices() {
  const stmt = db.prepare('SELECT * FROM services');
  return stmt.all();
}

// CRUD for staff
function createStaff(data) {
  const stmt = db.prepare('INSERT INTO staff (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getStaff(id) {
  const stmt = db.prepare('SELECT * FROM staff WHERE id = ?');
  return stmt.get(id);
}

function updateStaff(id, data) {
  const stmt = db.prepare('UPDATE staff SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteStaff(id) {
  const stmt = db.prepare('DELETE FROM staff WHERE id = ?');
  stmt.run(id);
}

function listStaff() {
  const stmt = db.prepare('SELECT * FROM staff');
  return stmt.all();
}

// CRUD for appointments
function createAppointment(data) {
  const stmt = db.prepare('INSERT INTO appointments (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getAppointment(id) {
  const stmt = db.prepare('SELECT * FROM appointments WHERE id = ?');
  return stmt.get(id);
}

function updateAppointment(id, data) {
  const stmt = db.prepare('UPDATE appointments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteAppointment(id) {
  const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
  stmt.run(id);
}

function listAppointments() {
  const stmt = db.prepare('SELECT * FROM appointments');
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


module.exports = {
  db,
  getSetting,
  setSetting,
  createService,
  getService,
  updateService,
  deleteService,
  listServices,
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  listStaff,
  createAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  listAppointments,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomers
};
