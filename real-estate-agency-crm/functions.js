
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for real-estate-agency-crm at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activities (
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

// CRUD for leads
function createLead(data) {
  const stmt = db.prepare('INSERT INTO leads (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getLead(id) {
  const stmt = db.prepare('SELECT * FROM leads WHERE id = ?');
  return stmt.get(id);
}

function updateLead(id, data) {
  const stmt = db.prepare('UPDATE leads SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteLead(id) {
  const stmt = db.prepare('DELETE FROM leads WHERE id = ?');
  stmt.run(id);
}

function listLeads() {
  const stmt = db.prepare('SELECT * FROM leads');
  return stmt.all();
}

// CRUD for contacts
function createContact(data) {
  const stmt = db.prepare('INSERT INTO contacts (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getContact(id) {
  const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
  return stmt.get(id);
}

function updateContact(id, data) {
  const stmt = db.prepare('UPDATE contacts SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteContact(id) {
  const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
  stmt.run(id);
}

function listContacts() {
  const stmt = db.prepare('SELECT * FROM contacts');
  return stmt.all();
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

// CRUD for activities
function createActivitie(data) {
  const stmt = db.prepare('INSERT INTO activities (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getActivitie(id) {
  const stmt = db.prepare('SELECT * FROM activities WHERE id = ?');
  return stmt.get(id);
}

function updateActivitie(id, data) {
  const stmt = db.prepare('UPDATE activities SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteActivitie(id) {
  const stmt = db.prepare('DELETE FROM activities WHERE id = ?');
  stmt.run(id);
}

function listActivities() {
  const stmt = db.prepare('SELECT * FROM activities');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createLead,
  getLead,
  updateLead,
  deleteLead,
  listLeads,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  listContacts,
  createPropertie,
  getPropertie,
  updatePropertie,
  deletePropertie,
  listProperties,
  createActivitie,
  getActivitie,
  updateActivitie,
  deleteActivitie,
  listActivities
};
