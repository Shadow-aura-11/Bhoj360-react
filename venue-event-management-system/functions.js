
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for venue-event-management-system at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
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

  CREATE TABLE IF NOT EXISTS attendees (
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

// CRUD for venues
function createVenue(data) {
  const stmt = db.prepare('INSERT INTO venues (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getVenue(id) {
  const stmt = db.prepare('SELECT * FROM venues WHERE id = ?');
  return stmt.get(id);
}

function updateVenue(id, data) {
  const stmt = db.prepare('UPDATE venues SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteVenue(id) {
  const stmt = db.prepare('DELETE FROM venues WHERE id = ?');
  stmt.run(id);
}

function listVenues() {
  const stmt = db.prepare('SELECT * FROM venues');
  return stmt.all();
}

// CRUD for events
function createEvent(data) {
  const stmt = db.prepare('INSERT INTO events (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getEvent(id) {
  const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
  return stmt.get(id);
}

function updateEvent(id, data) {
  const stmt = db.prepare('UPDATE events SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteEvent(id) {
  const stmt = db.prepare('DELETE FROM events WHERE id = ?');
  stmt.run(id);
}

function listEvents() {
  const stmt = db.prepare('SELECT * FROM events');
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

// CRUD for attendees
function createAttendee(data) {
  const stmt = db.prepare('INSERT INTO attendees (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getAttendee(id) {
  const stmt = db.prepare('SELECT * FROM attendees WHERE id = ?');
  return stmt.get(id);
}

function updateAttendee(id, data) {
  const stmt = db.prepare('UPDATE attendees SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteAttendee(id) {
  const stmt = db.prepare('DELETE FROM attendees WHERE id = ?');
  stmt.run(id);
}

function listAttendees() {
  const stmt = db.prepare('SELECT * FROM attendees');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createVenue,
  getVenue,
  updateVenue,
  deleteVenue,
  listVenues,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  listBookings,
  createAttendee,
  getAttendee,
  updateAttendee,
  deleteAttendee,
  listAttendees
};
