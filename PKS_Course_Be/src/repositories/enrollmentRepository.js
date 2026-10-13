const pool = require('../config/database');

async function create(connection, userId, courseId) {
  const [result] = await connection.query(
    'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
    [userId, courseId],
  );
  return result.insertId;
}

// async function remove(userId, courseId) {
//   const [result] = await pool.query(
//     'DELETE FROM enrollments WHERE user_id = ? AND course_id = ?',
//     [userId, courseId],
//   );
//   return result.affectedRows > 0;
// }

async function listByUser(userId) {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.category, c.description, c.instructor, c.fee, c.capacity,
            e.enrolled_at, 'ENROLLED' AS status
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.user_id = ? ORDER BY e.enrolled_at DESC`,
    [userId],
  );
  return rows;
}

async function exists(userId, courseId, connection = pool) {
  const [rows] = await connection.query(
    'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
    [userId, courseId],
  );
  return Boolean(rows[0]);
}

// module.exports = { create, remove, listByUser, exists };
module.exports = { create, listByUser, exists };
