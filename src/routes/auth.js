const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('documentId').trim().notEmpty(),
  body('monthlyIncome').isFloat({ min: 0 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post(
  '/register',
  registerValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/login',
  loginValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const result = await authService.login(req.body.email, req.body.password);
      res.json(result);
    } catch (e) {
      if (e.message === 'Credenciales inválidas') {
        return res.status(401).json({ error: e.message });
      }
      next(e);
    }
  }
);

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, firstName: true, lastName: true, documentId: true, monthlyIncome: true },
      include: { creditProfile: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
