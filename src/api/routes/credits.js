const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  simulateCreditUseCase,
  createCreditUseCase,
  getCreditsByClientUseCase,
  getCreditByIdUseCase,
  getScheduleUseCase,
  approveCreditUseCase,
  rejectCreditUseCase,
  disburseCreditUseCase,
} = require('../../container');

const router = express.Router();
router.use(authMiddleware);

router.post('/simulate', [
  body('amount').isFloat({ min: 1 }),
  body('termMonths').isInt({ min: 1, max: 60 }),
  body('annualRate').optional().isFloat({ min: 0 }),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const result = await simulateCreditUseCase.execute(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/', [
  body('clientId').notEmpty(),
  body('amount').isFloat({ min: 1 }),
  body('termMonths').isInt({ min: 1, max: 60 }),
  body('annualRate').optional().isFloat({ min: 0 }),
  body('creditEvaluationId').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { clientId, amount, termMonths, annualRate, creditEvaluationId } = req.body;
    const loan = await createCreditUseCase.execute(
      clientId,
      { amount, termMonths, annualRate, creditEvaluationId },
      req.userId
    );
    res.status(201).json(loan);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const clientId = req.query.clientId;
    if (!clientId) return res.status(400).json({ error: 'clientId es requerido' });
    const loans = await getCreditsByClientUseCase.execute(clientId, req.query.status || null);
    res.json(loans);
  } catch (e) {
    next(e);
  }
});

router.get('/:creditId', async (req, res, next) => {
  try {
    const loan = await getCreditByIdUseCase.execute(req.params.creditId, req.query.clientId || null);
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });
    res.json(loan);
  } catch (e) {
    next(e);
  }
});

router.get('/:creditId/schedule', async (req, res, next) => {
  try {
    const result = await getScheduleUseCase.execute(req.params.creditId, req.query.clientId || null);
    res.json(result);
  } catch (e) {
    if (e.message === 'Préstamo no encontrado') return res.status(404).json({ error: e.message });
    next(e);
  }
});

router.patch('/:creditId/approve', async (req, res, next) => {
  try {
    const loan = await approveCreditUseCase.execute(req.params.creditId, req.userId);
    res.json(loan);
  } catch (e) {
    if (e.message.includes('no encontrado') || e.message.includes('pendientes')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.patch('/:creditId/reject', async (req, res, next) => {
  try {
    const loan = await rejectCreditUseCase.execute(req.params.creditId, req.body.reason);
    res.json(loan);
  } catch (e) {
    if (e.message.includes('no encontrado') || e.message.includes('pendientes')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.post('/:creditId/disburse', async (req, res, next) => {
  try {
    const loan = await disburseCreditUseCase.execute(req.params.creditId);
    res.json(loan);
  } catch (e) {
    if (e.message.includes('no encontrado') || e.message.includes('aprobados')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

module.exports = router;
