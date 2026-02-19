const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  createClientUseCase,
  getScoringByClientUseCase,
  recalculateScoringUseCase,
  evaluateCreditUseCase,
} = require('../../container');

const router = express.Router();
router.use(authMiddleware);

const createClientValidation = [
  body('documentId').trim().notEmpty(),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('monthlyIncome').isFloat({ min: 0 }),
];

router.post('/', createClientValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const client = await createClientUseCase.execute(req.body);
    res.status(201).json(client);
  } catch (e) {
    if (e.message.includes('Ya existe')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.get('/:clientId/scoring', async (req, res, next) => {
  try {
    const result = await getScoringByClientUseCase.execute(req.params.clientId);
    res.json(result);
  } catch (e) {
    if (e.message === 'Cliente no encontrado') return res.status(404).json({ error: e.message });
    next(e);
  }
});

router.post('/:clientId/scoring/recalculate', async (req, res, next) => {
  try {
    const profile = await recalculateScoringUseCase.execute(req.params.clientId);
    res.json(profile);
  } catch (e) {
    if (e.message === 'Cliente no encontrado') return res.status(404).json({ error: e.message });
    next(e);
  }
});

router.post('/:clientId/scoring/evaluate', [
  body('amount').isFloat({ min: 1 }),
  body('termMonths').isInt({ min: 1, max: 60 }),
  body('annualRate').optional().isFloat({ min: 0 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { amount, termMonths, annualRate } = req.body;
    const result = await evaluateCreditUseCase.execute(
      req.params.clientId,
      { amount, termMonths, annualRate },
      req.userId
    );
    res.json(result);
  } catch (e) {
    if (e.message === 'Cliente no encontrado') return res.status(404).json({ error: e.message });
    next(e);
  }
});

module.exports = router;
