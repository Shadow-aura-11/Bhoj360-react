
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for event-management-system-ems at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
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

  CREATE TABLE IF NOT EXISTS speakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedules (
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

// CRUD for speakers
function createSpeaker(data) {
  const stmt = db.prepare('INSERT INTO speakers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getSpeaker(id) {
  const stmt = db.prepare('SELECT * FROM speakers WHERE id = ?');
  return stmt.get(id);
}

function updateSpeaker(id, data) {
  const stmt = db.prepare('UPDATE speakers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteSpeaker(id) {
  const stmt = db.prepare('DELETE FROM speakers WHERE id = ?');
  stmt.run(id);
}

function listSpeakers() {
  const stmt = db.prepare('SELECT * FROM speakers');
  return stmt.all();
}

// CRUD for schedules
function createSchedule(data) {
  const stmt = db.prepare('INSERT INTO schedules (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getSchedule(id) {
  const stmt = db.prepare('SELECT * FROM schedules WHERE id = ?');
  return stmt.get(id);
}

function updateSchedule(id, data) {
  const stmt = db.prepare('UPDATE schedules SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteSchedule(id) {
  const stmt = db.prepare('DELETE FROM schedules WHERE id = ?');
  stmt.run(id);
}

function listSchedules() {
  const stmt = db.prepare('SELECT * FROM schedules');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  createAttendee,
  getAttendee,
  updateAttendee,
  deleteAttendee,
  listAttendees,
  createSpeaker,
  getSpeaker,
  updateSpeaker,
  deleteSpeaker,
  listSpeakers,
  createSchedule,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  listSchedules
};
