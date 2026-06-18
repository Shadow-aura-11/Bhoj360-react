
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for coworking-space-management-system at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
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

// CRUD for spaces
function createSpace(data) {
  const stmt = db.prepare('INSERT INTO spaces (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getSpace(id) {
  const stmt = db.prepare('SELECT * FROM spaces WHERE id = ?');
  return stmt.get(id);
}

function updateSpace(id, data) {
  const stmt = db.prepare('UPDATE spaces SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteSpace(id) {
  const stmt = db.prepare('DELETE FROM spaces WHERE id = ?');
  stmt.run(id);
}

function listSpaces() {
  const stmt = db.prepare('SELECT * FROM spaces');
  return stmt.all();
}

// CRUD for members
function createMember(data) {
  const stmt = db.prepare('INSERT INTO members (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getMember(id) {
  const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
  return stmt.get(id);
}

function updateMember(id, data) {
  const stmt = db.prepare('UPDATE members SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteMember(id) {
  const stmt = db.prepare('DELETE FROM members WHERE id = ?');
  stmt.run(id);
}

function listMembers() {
  const stmt = db.prepare('SELECT * FROM members');
  return stmt.all();
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

// CRUD for invoices
function createInvoice(data) {
  const stmt = db.prepare('INSERT INTO invoices (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getInvoice(id) {
  const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?');
  return stmt.get(id);
}

function updateInvoice(id, data) {
  const stmt = db.prepare('UPDATE invoices SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteInvoice(id) {
  const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
  stmt.run(id);
}

function listInvoices() {
  const stmt = db.prepare('SELECT * FROM invoices');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createSpace,
  getSpace,
  updateSpace,
  deleteSpace,
  listSpaces,
  createMember,
  getMember,
  updateMember,
  deleteMember,
  listMembers,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  listBookings,
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  listInvoices
};
