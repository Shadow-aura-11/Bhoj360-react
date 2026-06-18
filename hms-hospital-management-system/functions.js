
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for hms-hospital-management-system at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
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

  CREATE TABLE IF NOT EXISTS medical_records (
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

// CRUD for doctors
function createDoctor(data) {
  const stmt = db.prepare('INSERT INTO doctors (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getDoctor(id) {
  const stmt = db.prepare('SELECT * FROM doctors WHERE id = ?');
  return stmt.get(id);
}

function updateDoctor(id, data) {
  const stmt = db.prepare('UPDATE doctors SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteDoctor(id) {
  const stmt = db.prepare('DELETE FROM doctors WHERE id = ?');
  stmt.run(id);
}

function listDoctors() {
  const stmt = db.prepare('SELECT * FROM doctors');
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

// CRUD for medical_records
function createMedical_record(data) {
  const stmt = db.prepare('INSERT INTO medical_records (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getMedical_record(id) {
  const stmt = db.prepare('SELECT * FROM medical_records WHERE id = ?');
  return stmt.get(id);
}

function updateMedical_record(id, data) {
  const stmt = db.prepare('UPDATE medical_records SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteMedical_record(id) {
  const stmt = db.prepare('DELETE FROM medical_records WHERE id = ?');
  stmt.run(id);
}

function listMedical_records() {
  const stmt = db.prepare('SELECT * FROM medical_records');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createPatient,
  getPatient,
  updatePatient,
  deletePatient,
  listPatients,
  createDoctor,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  listDoctors,
  createAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  listAppointments,
  createMedical_record,
  getMedical_record,
  updateMedical_record,
  deleteMedical_record,
  listMedical_records
};
