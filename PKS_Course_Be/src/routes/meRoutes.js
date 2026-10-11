const express = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const courseService = require('../services/courseService');

const router = express.Router();
router.use(requireAuth);

router.get('/enrollments', requireRole('STUDENT'), asyncHandler(async (req, res) => {
  const data = await courseService.myEnrollments(req.user.userId);
  res.json({ success: true, data });
}));

module.exports = router;
