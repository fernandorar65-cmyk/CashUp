const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken(payload) {
  return jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

async function register({ email, password, firstName, lastName, documentId, monthlyIncome }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { documentId }] },
  });
  if (existing) {
    const field = existing.email === email ? 'email' : 'documentId';
    throw new Error(`Ya existe un usuario con este ${field}`);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      documentId,
      monthlyIncome: Number(monthlyIncome),
    },
    select: { id: true, email: true, firstName: true, lastName: true, documentId: true, monthlyIncome: true, createdAt: true },
  });

  await prisma.creditProfile.create({
    data: {
      userId: user.id,
      creditScore: 50,
    },
  });

  const token = generateToken({ userId: user.id, email: user.email });
  return { user, token };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { creditProfile: true },
  });
  if (!user) throw new Error('Credenciales inválidas');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error('Credenciales inválidas');

  const token = generateToken({ userId: user.id, email: user.email });
  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  register,
  login,
};
