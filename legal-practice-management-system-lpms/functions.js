
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for legal-practice-management-system-lpms at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lawyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
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

// CRUD for clients
function createClient(data) {
  const stmt = db.prepare('INSERT INTO clients (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getClient(id) {
  const stmt = db.prepare('SELECT * FROM clients WHERE id = ?');
  return stmt.get(id);
}

function updateClient(id, data) {
  const stmt = db.prepare('UPDATE clients SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteClient(id) {
  const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
  stmt.run(id);
}

function listClients() {
  const stmt = db.prepare('SELECT * FROM clients');
  return stmt.all();
}

// CRUD for cases
function createCase(data) {
  const stmt = db.prepare('INSERT INTO cases (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getCase(id) {
  const stmt = db.prepare('SELECT * FROM cases WHERE id = ?');
  return stmt.get(id);
}

function updateCase(id, data) {
  const stmt = db.prepare('UPDATE cases SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteCase(id) {
  const stmt = db.prepare('DELETE FROM cases WHERE id = ?');
  stmt.run(id);
}

function listCases() {
  const stmt = db.prepare('SELECT * FROM cases');
  return stmt.all();
}

// CRUD for lawyers
function createLawyer(data) {
  const stmt = db.prepare('INSERT INTO lawyers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getLawyer(id) {
  const stmt = db.prepare('SELECT * FROM lawyers WHERE id = ?');
  return stmt.get(id);
}

function updateLawyer(id, data) {
  const stmt = db.prepare('UPDATE lawyers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteLawyer(id) {
  const stmt = db.prepare('DELETE FROM lawyers WHERE id = ?');
  stmt.run(id);
}

function listLawyers() {
  const stmt = db.prepare('SELECT * FROM lawyers');
  return stmt.all();
}

// CRUD for documents
function createDocument(data) {
  const stmt = db.prepare('INSERT INTO documents (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getDocument(id) {
  const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
  return stmt.get(id);
}

function updateDocument(id, data) {
  const stmt = db.prepare('UPDATE documents SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteDocument(id) {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  stmt.run(id);
}

function listDocuments() {
  const stmt = db.prepare('SELECT * FROM documents');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createClient,
  getClient,
  updateClient,
  deleteClient,
  listClients,
  createCase,
  getCase,
  updateCase,
  deleteCase,
  listCases,
  createLawyer,
  getLawyer,
  updateLawyer,
  deleteLawyer,
  listLawyers,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  listDocuments
};
