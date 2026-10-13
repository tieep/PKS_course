const express = require('express');
const { query, param } = require('express-validator');
const courseService = require('../services/courseService');
const validate = require('../middlewares/validation');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();
const courseId = param('courseId').isInt({ min: 1 }).toInt();

router.get('/', [
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category').optional().isString().trim().isLength({ max: 100 }),
], validate, asyncHandler(async (req, res) => {
  const data = await courseService.list(req.query);
  res.json({ success: true, data });
}));

router.get('/:courseId', courseId, validate, asyncHandler(async (req, res) => {
  const data = await courseService.detail(req.params.courseId);
  res.json({ success: true, data });
}));

router.post('/:courseId/enroll', requireAuth, requireRole('STUDENT'), courseId, validate, asyncHandler(async (req, res) => {
  const data = await courseService.enroll(req.user.userId, req.params.courseId);
  res.status(201).json({ success: true, data });
}));

// router.delete('/:courseId/enroll', requireAuth, requireRole('STUDENT'), courseId, validate, asyncHandler(async (req, res) => {
//   const data = await courseService.unenroll(req.user.userId, req.params.courseId);
//   res.json({ success: true, data });
// }));

module.exports = router;
