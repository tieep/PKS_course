const express = require('express');
const { body } = require('express-validator');
const authService = require('../services/authService');
const validate = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();
const credentials = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6, max: 72 }),
];

router.post('/register', [
  body('fullName').isString().trim().isLength({ min: 2, max: 120 }),
  ...credentials,
], validate, asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}));

router.post('/login', credentials, validate, asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.userId);
  res.json({ success: true, data: user });
}));

module.exports = router;
