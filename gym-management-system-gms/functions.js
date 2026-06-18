
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for gym-management-system-gms at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS memberships (
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

// CRUD for classes
function createClasse(data) {
  const stmt = db.prepare('INSERT INTO classes (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getClasse(id) {
  const stmt = db.prepare('SELECT * FROM classes WHERE id = ?');
  return stmt.get(id);
}

function updateClasse(id, data) {
  const stmt = db.prepare('UPDATE classes SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteClasse(id) {
  const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
  stmt.run(id);
}

function listClasses() {
  const stmt = db.prepare('SELECT * FROM classes');
  return stmt.all();
}

// CRUD for trainers
function createTrainer(data) {
  const stmt = db.prepare('INSERT INTO trainers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getTrainer(id) {
  const stmt = db.prepare('SELECT * FROM trainers WHERE id = ?');
  return stmt.get(id);
}

function updateTrainer(id, data) {
  const stmt = db.prepare('UPDATE trainers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteTrainer(id) {
  const stmt = db.prepare('DELETE FROM trainers WHERE id = ?');
  stmt.run(id);
}

function listTrainers() {
  const stmt = db.prepare('SELECT * FROM trainers');
  return stmt.all();
}

// CRUD for memberships
function createMembership(data) {
  const stmt = db.prepare('INSERT INTO memberships (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getMembership(id) {
  const stmt = db.prepare('SELECT * FROM memberships WHERE id = ?');
  return stmt.get(id);
}

function updateMembership(id, data) {
  const stmt = db.prepare('UPDATE memberships SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteMembership(id) {
  const stmt = db.prepare('DELETE FROM memberships WHERE id = ?');
  stmt.run(id);
}

function listMemberships() {
  const stmt = db.prepare('SELECT * FROM memberships');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createMember,
  getMember,
  updateMember,
  deleteMember,
  listMembers,
  createClasse,
  getClasse,
  updateClasse,
  deleteClasse,
  listClasses,
  createTrainer,
  getTrainer,
  updateTrainer,
  deleteTrainer,
  listTrainers,
  createMembership,
  getMembership,
  updateMembership,
  deleteMembership,
  listMemberships
};
