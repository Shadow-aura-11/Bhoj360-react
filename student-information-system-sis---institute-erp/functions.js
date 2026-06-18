
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('Database initialized for student-information-system-sis---institute-erp at ' + dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS grades (
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

// CRUD for students
function createStudent(data) {
  const stmt = db.prepare('INSERT INTO students (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getStudent(id) {
  const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
  return stmt.get(id);
}

function updateStudent(id, data) {
  const stmt = db.prepare('UPDATE students SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteStudent(id) {
  const stmt = db.prepare('DELETE FROM students WHERE id = ?');
  stmt.run(id);
}

function listStudents() {
  const stmt = db.prepare('SELECT * FROM students');
  return stmt.all();
}

// CRUD for courses
function createCourse(data) {
  const stmt = db.prepare('INSERT INTO courses (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getCourse(id) {
  const stmt = db.prepare('SELECT * FROM courses WHERE id = ?');
  return stmt.get(id);
}

function updateCourse(id, data) {
  const stmt = db.prepare('UPDATE courses SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteCourse(id) {
  const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
  stmt.run(id);
}

function listCourses() {
  const stmt = db.prepare('SELECT * FROM courses');
  return stmt.all();
}

// CRUD for enrollments
function createEnrollment(data) {
  const stmt = db.prepare('INSERT INTO enrollments (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getEnrollment(id) {
  const stmt = db.prepare('SELECT * FROM enrollments WHERE id = ?');
  return stmt.get(id);
}

function updateEnrollment(id, data) {
  const stmt = db.prepare('UPDATE enrollments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteEnrollment(id) {
  const stmt = db.prepare('DELETE FROM enrollments WHERE id = ?');
  stmt.run(id);
}

function listEnrollments() {
  const stmt = db.prepare('SELECT * FROM enrollments');
  return stmt.all();
}

// CRUD for grades
function createGrade(data) {
  const stmt = db.prepare('INSERT INTO grades (name, description) VALUES (?, ?)');
  const info = stmt.run(data.name, data.description);
  return info.lastInsertRowid;
}

function getGrade(id) {
  const stmt = db.prepare('SELECT * FROM grades WHERE id = ?');
  return stmt.get(id);
}

function updateGrade(id, data) {
  const stmt = db.prepare('UPDATE grades SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(data.name, data.description, id);
}

function deleteGrade(id) {
  const stmt = db.prepare('DELETE FROM grades WHERE id = ?');
  stmt.run(id);
}

function listGrades() {
  const stmt = db.prepare('SELECT * FROM grades');
  return stmt.all();
}


module.exports = {
  db,
  getSetting,
  setSetting,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  listStudents,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  listCourses,
  createEnrollment,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment,
  listEnrollments,
  createGrade,
  getGrade,
  updateGrade,
  deleteGrade,
  listGrades
};
