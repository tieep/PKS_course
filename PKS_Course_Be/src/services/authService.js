const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');
const userRepository = require('../repositories/userRepository');

function createToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' },
  );
}

async function register({ fullName, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  if (await userRepository.findByEmail(normalizedEmail)) {
    throw new HttpError(409, 'Email is already registered');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ fullName: fullName.trim(), email: normalizedEmail, passwordHash });
  return { user, token: createToken(user) };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  const { password_hash: ignored, ...publicUser } = user;
  return { user: publicUser, token: createToken(user) };
}

async function me(userId) {
  const user = await userRepository.findPublicById(userId);
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

async function updateRole(actorId, userId, role) {
  if (Number(actorId) === Number(userId) && role !== 'ADMIN') {
    throw new HttpError(409, 'You cannot remove your own admin role');
  }
  const user = await userRepository.findPublicById(userId);
  if (!user) throw new HttpError(404, 'User not found');
  return userRepository.updateRole(userId, role);
}

module.exports = { register, login, me, updateRole };
