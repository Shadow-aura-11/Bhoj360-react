
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for franchise-management-system-fms at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS franchises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS royalties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inspections (
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

// CRUD for franchises
function createFranchise(data) {
  const stmt = db.prepare('INSERT INTO franchises (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getFranchise(id) {
  const stmt = db.prepare('SELECT * FROM franchises WHERE id = ?');
  return stmt.get(id);
}

function updateFranchise(id, data) {
  const stmt = db.prepare('UPDATE franchises SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteFranchise(id) {
  const stmt = db.prepare('DELETE FROM franchises WHERE id = ?');
  stmt.run(id);
}

function listFranchises() {
  const stmt = db.prepare('SELECT * FROM franchises');
  return stmt.all();
}

// CRUD for owners
function createOwner(data) {
  const stmt = db.prepare('INSERT INTO owners (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getOwner(id) {
  const stmt = db.prepare('SELECT * FROM owners WHERE id = ?');
  return stmt.get(id);
}

function updateOwner(id, data) {
  const stmt = db.prepare('UPDATE owners SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteOwner(id) {
  const stmt = db.prepare('DELETE FROM owners WHERE id = ?');
  stmt.run(id);
}

function listOwners() {
  const stmt = db.prepare('SELECT * FROM owners');
  return stmt.all();
}

// CRUD for royalties
function createRoyaltie(data) {
  const stmt = db.prepare('INSERT INTO royalties (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getRoyaltie(id) {
  const stmt = db.prepare('SELECT * FROM royalties WHERE id = ?');
  return stmt.get(id);
}

function updateRoyaltie(id, data) {
  const stmt = db.prepare('UPDATE royalties SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteRoyaltie(id) {
  const stmt = db.prepare('DELETE FROM royalties WHERE id = ?');
  stmt.run(id);
}

function listRoyalties() {
  const stmt = db.prepare('SELECT * FROM royalties');
  return stmt.all();
}

// CRUD for inspections
function createInspection(data) {
  const stmt = db.prepare('INSERT INTO inspections (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getInspection(id) {
  const stmt = db.prepare('SELECT * FROM inspections WHERE id = ?');
  return stmt.get(id);
}

function updateInspection(id, data) {
  const stmt = db.prepare('UPDATE inspections SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteInspection(id) {
  const stmt = db.prepare('DELETE FROM inspections WHERE id = ?');
  stmt.run(id);
}

function listInspections() {
  const stmt = db.prepare('SELECT * FROM inspections');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createFranchise,
  getFranchise,
  updateFranchise,
  deleteFranchise,
  listFranchises,
  createOwner,
  getOwner,
  updateOwner,
  deleteOwner,
  listOwners,
  createRoyaltie,
  getRoyaltie,
  updateRoyaltie,
  deleteRoyaltie,
  listRoyalties,
  createInspection,
  getInspection,
  updateInspection,
  deleteInspection,
  listInspections
};
