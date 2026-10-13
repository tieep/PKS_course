const express = require('express');
const { body, param, query } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const validate = require('../middlewares/validation');
const courseService = require('../services/courseService');
const authService = require('../services/authService');

const router = express.Router();
const courseId = param('courseId').isInt({ min: 1 }).toInt();
const userId = param('userId').isInt({ min: 1 }).toInt();
const courseFields = [
  body('name').isString().trim().isLength({ min: 2, max: 180 }),
  body('category').isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional({ nullable: true }).isString(),
  body('instructor').isString().trim().isLength({ min: 2, max: 120 }),
  body('fee').isFloat({ min: 0 }).toFloat(),
  body('isHidden').optional().isBoolean().toBoolean(),
  body('capacity').isInt({ min: 1 }).toInt(),
];

router.use(requireAuth, requireRole('ADMIN'));

router.patch('/users/:userId/role', [
  userId,
  body('role').isIn(['STUDENT', 'ADMIN']),
], validate, asyncHandler(async (req, res) => {
  const data = await authService.updateRole(req.user.userId, req.params.userId, req.body.role);
  res.json({ success: true, data });
}));

router.get('/courses', [
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category').optional().isString().trim().isLength({ max: 100 }),
], validate, asyncHandler(async (req, res) => {
  const data = await courseService.list({ ...req.query, includeHidden: true });
  res.json({ success: true, data });
}));

router.post('/courses', courseFields, validate, asyncHandler(async (req, res) => {
  const data = await courseService.create(req.body);
  res.status(201).json({ success: true, data });
}));

router.put('/courses/:courseId', courseId, courseFields, validate, asyncHandler(async (req, res) => {
  const data = await courseService.update(req.params.courseId, req.body);
  res.json({ success: true, data });
}));

router.delete('/courses/:courseId', courseId, validate, asyncHandler(async (req, res) => {
  const data = await courseService.remove(req.params.courseId);
  res.json({ success: true, data: { deleted: data } });
}));

router.patch('/courses/:courseId/visibility', [
  courseId,
  body('isHidden').isBoolean().toBoolean(),
], validate, asyncHandler(async (req, res) => {
  const data = await courseService.setVisibility(req.params.courseId, req.body.isHidden);
  res.json({ success: true, data });
}));

router.get('/courses/:courseId/students', courseId, validate, asyncHandler(async (req, res) => {
  const data = await courseService.students(req.params.courseId);
  res.json({ success: true, data });
}));

module.exports = router;
