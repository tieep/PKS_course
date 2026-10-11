const pool = require('../config/database');
const HttpError = require('../utils/httpError');
const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');

function validateCourseId(courseId) {
  const id = Number(courseId);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Invalid course id');
  return id;
}

async function list(filters) {
  return courseRepository.list(filters);
}

async function create(data) {
  return courseRepository.create(data);
}

async function update(id, data) {
  const courseId = validateCourseId(id);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const course = await courseRepository.findForUpdate(courseId, connection);
    if (!course) throw new HttpError(404, 'Course not found');
    const enrolled = await courseRepository.countEnrollments(courseId, connection);
    if (data.capacity < enrolled) {
      throw new HttpError(409, `Capacity cannot be lower than ${enrolled} enrolled students`);
    }
    await courseRepository.update(courseId, data, connection);
    await connection.commit();
    return courseRepository.findById(courseId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function remove(id) {
  const courseId = validateCourseId(id);
  const course = await courseRepository.findById(courseId);
  if (!course) throw new HttpError(404, 'Course not found');
  const enrolled = await courseRepository.countEnrollments(courseId);
  if (enrolled > 0) {
    throw new HttpError(409, 'Cannot delete a course with enrolled students');
  }
  return courseRepository.remove(courseId);
}

async function enroll(userId, id) {
  const courseId = validateCourseId(id);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const course = await courseRepository.findForUpdate(courseId, connection);
    if (!course) throw new HttpError(404, 'Course not found');
    if (await enrollmentRepository.exists(userId, courseId, connection)) {
      throw new HttpError(409, 'You are already enrolled in this course');
    }
    const enrolled = await courseRepository.countEnrollments(courseId, connection);
    if (enrolled >= course.capacity) throw new HttpError(409, 'Course is full');
    await enrollmentRepository.create(connection, userId, courseId);
    await connection.commit();
    return courseRepository.findById(courseId);
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'You are already enrolled in this course');
    throw error;
  } finally {
    connection.release();
  }
}

async function unenroll(userId, id) {
  const courseId = validateCourseId(id);
  const removed = await enrollmentRepository.remove(userId, courseId);
  if (!removed) throw new HttpError(404, 'Enrollment not found');
  return { message: 'Enrollment cancelled' };
}

async function myEnrollments(userId) {
  return enrollmentRepository.listByUser(userId);
}

async function students(id) {
  const courseId = validateCourseId(id);
  const course = await courseRepository.findById(courseId);
  if (!course) throw new HttpError(404, 'Course not found');
  return courseRepository.listStudents(courseId);
}

module.exports = { list, create, update, remove, enroll, unenroll, myEnrollments, students };
