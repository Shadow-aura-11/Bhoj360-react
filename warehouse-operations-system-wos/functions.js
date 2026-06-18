
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for warehouse-operations-system-wos at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS locations (
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

// CRUD for workers
function createWorker(data) {
  const stmt = db.prepare('INSERT INTO workers (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getWorker(id) {
  const stmt = db.prepare('SELECT * FROM workers WHERE id = ?');
  return stmt.get(id);
}

function updateWorker(id, data) {
  const stmt = db.prepare('UPDATE workers SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteWorker(id) {
  const stmt = db.prepare('DELETE FROM workers WHERE id = ?');
  stmt.run(id);
}

function listWorkers() {
  const stmt = db.prepare('SELECT * FROM workers');
  return stmt.all();
}

// CRUD for equipment
function createEquipment(data) {
  const stmt = db.prepare('INSERT INTO equipment (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getEquipment(id) {
  const stmt = db.prepare('SELECT * FROM equipment WHERE id = ?');
  return stmt.get(id);
}

function updateEquipment(id, data) {
  const stmt = db.prepare('UPDATE equipment SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteEquipment(id) {
  const stmt = db.prepare('DELETE FROM equipment WHERE id = ?');
  stmt.run(id);
}

function listEquipment() {
  const stmt = db.prepare('SELECT * FROM equipment');
  return stmt.all();
}

// CRUD for locations
function createLocation(data) {
  const stmt = db.prepare('INSERT INTO locations (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getLocation(id) {
  const stmt = db.prepare('SELECT * FROM locations WHERE id = ?');
  return stmt.get(id);
}

function updateLocation(id, data) {
  const stmt = db.prepare('UPDATE locations SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteLocation(id) {
  const stmt = db.prepare('DELETE FROM locations WHERE id = ?');
  stmt.run(id);
}

function listLocations() {
  const stmt = db.prepare('SELECT * FROM locations');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  listTasks,
  createWorker,
  getWorker,
  updateWorker,
  deleteWorker,
  listWorkers,
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
  listEquipment,
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
  listLocations
};
