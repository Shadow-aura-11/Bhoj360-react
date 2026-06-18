
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for construction-management-system-cms at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
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

// CRUD for projects
function createProject(data) {
  const stmt = db.prepare('INSERT INTO projects (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getProject(id) {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  return stmt.get(id);
}

function updateProject(id, data) {
  const stmt = db.prepare('UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteProject(id) {
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  stmt.run(id);
}

function listProjects() {
  const stmt = db.prepare('SELECT * FROM projects');
  return stmt.all();
}

// CRUD for contractors
function createContractor(data) {
  const stmt = db.prepare('INSERT INTO contractors (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getContractor(id) {
  const stmt = db.prepare('SELECT * FROM contractors WHERE id = ?');
  return stmt.get(id);
}

function updateContractor(id, data) {
  const stmt = db.prepare('UPDATE contractors SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteContractor(id) {
  const stmt = db.prepare('DELETE FROM contractors WHERE id = ?');
  stmt.run(id);
}

function listContractors() {
  const stmt = db.prepare('SELECT * FROM contractors');
  return stmt.all();
}

// CRUD for materials
function createMaterial(data) {
  const stmt = db.prepare('INSERT INTO materials (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getMaterial(id) {
  const stmt = db.prepare('SELECT * FROM materials WHERE id = ?');
  return stmt.get(id);
}

function updateMaterial(id, data) {
  const stmt = db.prepare('UPDATE materials SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteMaterial(id) {
  const stmt = db.prepare('DELETE FROM materials WHERE id = ?');
  stmt.run(id);
}

function listMaterials() {
  const stmt = db.prepare('SELECT * FROM materials');
  return stmt.all();
}

// CRUD for tasks
function createTask(data) {
  const stmt = db.prepare('INSERT INTO tasks (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getTask(id) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id);
}

function updateTask(id, data) {
  const stmt = db.prepare('UPDATE tasks SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteTask(id) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
}

function listTasks() {
  const stmt = db.prepare('SELECT * FROM tasks');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listProjects,
  createContractor,
  getContractor,
  updateContractor,
  deleteContractor,
  listContractors,
  createMaterial,
  getMaterial,
  updateMaterial,
  deleteMaterial,
  listMaterials,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  listTasks
};
