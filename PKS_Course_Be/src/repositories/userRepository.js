const pool = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, password_hash, role, created_at FROM users WHERE email = ?',
    [email],
  );
  return rows[0] || null;
}

async function findPublicById(id) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
    [id],
  );
  return rows[0] || null;
}

async function updateRole(id, role) {
  const [result] = await pool.query(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id],
  );
  return result.affectedRows ? findPublicById(id) : null;
}

async function create({ fullName, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [fullName, email, passwordHash, 'STUDENT'],
  );
  return findPublicById(result.insertId);
}

module.exports = { findByEmail, findPublicById, updateRole, create };
