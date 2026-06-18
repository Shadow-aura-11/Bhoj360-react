
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for pharmacy-management-system at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
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

// CRUD for drugs
function createDrug(data) {
  const stmt = db.prepare('INSERT INTO drugs (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getDrug(id) {
  const stmt = db.prepare('SELECT * FROM drugs WHERE id = ?');
  return stmt.get(id);
}

function updateDrug(id, data) {
  const stmt = db.prepare('UPDATE drugs SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteDrug(id) {
  const stmt = db.prepare('DELETE FROM drugs WHERE id = ?');
  stmt.run(id);
}

function listDrugs() {
  const stmt = db.prepare('SELECT * FROM drugs');
  return stmt.all();
}

// CRUD for prescriptions
function createPrescription(data) {
  const stmt = db.prepare('INSERT INTO prescriptions (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getPrescription(id) {
  const stmt = db.prepare('SELECT * FROM prescriptions WHERE id = ?');
  return stmt.get(id);
}

function updatePrescription(id, data) {
  const stmt = db.prepare('UPDATE prescriptions SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deletePrescription(id) {
  const stmt = db.prepare('DELETE FROM prescriptions WHERE id = ?');
  stmt.run(id);
}

function listPrescriptions() {
  const stmt = db.prepare('SELECT * FROM prescriptions');
  return stmt.all();
}

// CRUD for patients
function createPatient(data) {
  const stmt = db.prepare('INSERT INTO patients (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getPatient(id) {
  const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
  return stmt.get(id);
}

function updatePatient(id, data) {
  const stmt = db.prepare('UPDATE patients SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deletePatient(id) {
  const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
  stmt.run(id);
}

function listPatients() {
  const stmt = db.prepare('SELECT * FROM patients');
  return stmt.all();
}

// CRUD for sales
function createSale(data) {
  const stmt = db.prepare('INSERT INTO sales (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getSale(id) {
  const stmt = db.prepare('SELECT * FROM sales WHERE id = ?');
  return stmt.get(id);
}

function updateSale(id, data) {
  const stmt = db.prepare('UPDATE sales SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteSale(id) {
  const stmt = db.prepare('DELETE FROM sales WHERE id = ?');
  stmt.run(id);
}

function listSales() {
  const stmt = db.prepare('SELECT * FROM sales');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createDrug,
  getDrug,
  updateDrug,
  deleteDrug,
  listDrugs,
  createPrescription,
  getPrescription,
  updatePrescription,
  deletePrescription,
  listPrescriptions,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
  listPatients,
  createSale,
  getSale,
  updateSale,
  deleteSale,
  listSales
};
