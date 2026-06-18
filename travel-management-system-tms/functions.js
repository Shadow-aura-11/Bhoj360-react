
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for travel-management-system-tms at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS itineraries (
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

  CREATE TABLE IF NOT EXISTS payments (
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

// CRUD for bookings
function createBooking(data) {
  const stmt = db.prepare('INSERT INTO bookings (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getBooking(id) {
  const stmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
  return stmt.get(id);
}

function updateBooking(id, data) {
  const stmt = db.prepare('UPDATE bookings SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteBooking(id) {
  const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
  stmt.run(id);
}

function listBookings() {
  const stmt = db.prepare('SELECT * FROM bookings');
  return stmt.all();
}

// CRUD for itineraries
function createItinerarie(data) {
  const stmt = db.prepare('INSERT INTO itineraries (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getItinerarie(id) {
  const stmt = db.prepare('SELECT * FROM itineraries WHERE id = ?');
  return stmt.get(id);
}

function updateItinerarie(id, data) {
  const stmt = db.prepare('UPDATE itineraries SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteItinerarie(id) {
  const stmt = db.prepare('DELETE FROM itineraries WHERE id = ?');
  stmt.run(id);
}

function listItineraries() {
  const stmt = db.prepare('SELECT * FROM itineraries');
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

// CRUD for payments
function createPayment(data) {
  const stmt = db.prepare('INSERT INTO payments (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getPayment(id) {
  const stmt = db.prepare('SELECT * FROM payments WHERE id = ?');
  return stmt.get(id);
}

function updatePayment(id, data) {
  const stmt = db.prepare('UPDATE payments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deletePayment(id) {
  const stmt = db.prepare('DELETE FROM payments WHERE id = ?');
  stmt.run(id);
}

function listPayments() {
  const stmt = db.prepare('SELECT * FROM payments');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  listBookings,
  createItinerarie,
  getItinerarie,
  updateItinerarie,
  deleteItinerarie,
  listItineraries,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  listCustomers,
  createPayment,
  getPayment,
  updatePayment,
  deletePayment,
  listPayments
};
