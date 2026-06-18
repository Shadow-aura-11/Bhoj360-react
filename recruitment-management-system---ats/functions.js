
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for recruitment-management-system---ats at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
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

// CRUD for candidates
function createCandidate(data) {
  const stmt = db.prepare('INSERT INTO candidates (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getCandidate(id) {
  const stmt = db.prepare('SELECT * FROM candidates WHERE id = ?');
  return stmt.get(id);
}

function updateCandidate(id, data) {
  const stmt = db.prepare('UPDATE candidates SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteCandidate(id) {
  const stmt = db.prepare('DELETE FROM candidates WHERE id = ?');
  stmt.run(id);
}

function listCandidates() {
  const stmt = db.prepare('SELECT * FROM candidates');
  return stmt.all();
}

// CRUD for jobs
function createJob(data) {
  const stmt = db.prepare('INSERT INTO jobs (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getJob(id) {
  const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
  return stmt.get(id);
}

function updateJob(id, data) {
  const stmt = db.prepare('UPDATE jobs SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteJob(id) {
  const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
  stmt.run(id);
}

function listJobs() {
  const stmt = db.prepare('SELECT * FROM jobs');
  return stmt.all();
}

// CRUD for interviews
function createInterview(data) {
  const stmt = db.prepare('INSERT INTO interviews (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getInterview(id) {
  const stmt = db.prepare('SELECT * FROM interviews WHERE id = ?');
  return stmt.get(id);
}

function updateInterview(id, data) {
  const stmt = db.prepare('UPDATE interviews SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteInterview(id) {
  const stmt = db.prepare('DELETE FROM interviews WHERE id = ?');
  stmt.run(id);
}

function listInterviews() {
  const stmt = db.prepare('SELECT * FROM interviews');
  return stmt.all();
}

// CRUD for applications
function createApplication(data) {
  const stmt = db.prepare('INSERT INTO applications (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getApplication(id) {
  const stmt = db.prepare('SELECT * FROM applications WHERE id = ?');
  return stmt.get(id);
}

function updateApplication(id, data) {
  const stmt = db.prepare('UPDATE applications SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteApplication(id) {
  const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
  stmt.run(id);
}

function listApplications() {
  const stmt = db.prepare('SELECT * FROM applications');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createCandidate,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  listCandidates,
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobs,
  createInterview,
  getInterview,
  updateInterview,
  deleteInterview,
  listInterviews,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  listApplications
};
