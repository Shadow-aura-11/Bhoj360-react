
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for farm-management-information-system-fmis at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS livestock (
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

// CRUD for crops
function createCrop(data) {
  const stmt = db.prepare('INSERT INTO crops (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getCrop(id) {
  const stmt = db.prepare('SELECT * FROM crops WHERE id = ?');
  return stmt.get(id);
}

function updateCrop(id, data) {
  const stmt = db.prepare('UPDATE crops SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteCrop(id) {
  const stmt = db.prepare('DELETE FROM crops WHERE id = ?');
  stmt.run(id);
}

function listCrops() {
  const stmt = db.prepare('SELECT * FROM crops');
  return stmt.all();
}

// CRUD for livestock
function createLivestock(data) {
  const stmt = db.prepare('INSERT INTO livestock (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getLivestock(id) {
  const stmt = db.prepare('SELECT * FROM livestock WHERE id = ?');
  return stmt.get(id);
}

function updateLivestock(id, data) {
  const stmt = db.prepare('UPDATE livestock SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteLivestock(id) {
  const stmt = db.prepare('DELETE FROM livestock WHERE id = ?');
  stmt.run(id);
}

function listLivestock() {
  const stmt = db.prepare('SELECT * FROM livestock');
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
  createCrop,
  getCrop,
  updateCrop,
  deleteCrop,
  listCrops,
  createLivestock,
  getLivestock,
  updateLivestock,
  deleteLivestock,
  listLivestock,
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
  listEquipment,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  listTasks
};
