const pool = require('../config/database');

const courseSelect = `
  SELECT c.id, c.name, c.category, c.description, c.instructor, c.capacity,
         COUNT(e.id) AS enrolled_count,
         CASE WHEN COUNT(e.id) >= c.capacity THEN 'FULL' ELSE 'AVAILABLE' END AS enrollment_status,
         c.created_at, c.updated_at
  FROM courses c
  LEFT JOIN enrollments e ON e.course_id = c.id
`;

function courseGroupBy() {
  return ' GROUP BY c.id, c.name, c.category, c.description, c.instructor, c.capacity, c.created_at, c.updated_at';
}

async function list(filters = {}) {
  const values = [];
  const conditions = [];
  if (filters.search) {
    conditions.push('(c.name LIKE ? OR c.instructor LIKE ?)');
    values.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.category) {
    conditions.push('c.category = ?');
    values.push(filters.category);
  }
  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`${courseSelect}${where}${courseGroupBy()} ORDER BY c.id`, values);
  return rows;
}

async function findById(id, connection = pool) {
  const [rows] = await connection.query(
    `${courseSelect} WHERE c.id = ?${courseGroupBy()}`,
    [id],
  );
  return rows[0] || null;
}

async function findForUpdate(id, connection) {
  const [rows] = await connection.query(
    'SELECT id, capacity FROM courses WHERE id = ? FOR UPDATE',
    [id],
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    'INSERT INTO courses (name, category, description, instructor, capacity) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.category, data.description || null, data.instructor, data.capacity],
  );
  return findById(result.insertId);
}

async function update(id, data, connection = pool) {
  const [result] = await connection.query(
    'UPDATE courses SET name = ?, category = ?, description = ?, instructor = ?, capacity = ? WHERE id = ?',
    [data.name, data.category, data.description || null, data.instructor, data.capacity, id],
  );
  return result.affectedRows ? findById(id, connection) : null;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function countEnrollments(courseId, connection = pool) {
  const [rows] = await connection.query('SELECT COUNT(*) AS count FROM enrollments WHERE course_id = ?', [courseId]);
  return Number(rows[0].count);
}

async function listStudents(courseId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, c.name AS course_name,
            e.enrolled_at, 'ENROLLED' AS status
     FROM enrollments e
     JOIN users u ON u.id = e.user_id
     JOIN courses c ON c.id = e.course_id
     WHERE e.course_id = ? ORDER BY e.enrolled_at DESC`,
    [courseId],
  );
  return rows;
}

module.exports = {
  list,
  findById,
  findForUpdate,
  create,
  update,
  remove,
  countEnrollments,
  listStudents,
};
