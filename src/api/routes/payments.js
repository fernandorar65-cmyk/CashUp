const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  recordPaymentUseCase,
  getPaymentsByCreditUseCase,
  getPaymentByIdUseCase,
} = require('../../container');

const router = express.Router();
router.use(authMiddleware);

router.post('/', [
  body('clientId').notEmpty(),
  body('loanId').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('paymentMethod').optional().isString(),
  body('reference').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { clientId, loanId, amount, paymentMethod, reference } = req.body;
    const payment = await recordPaymentUseCase.execute(
      clientId,
      loanId,
      { amount, paymentMethod, reference },
      req.userId
    );
    res.status(201).json(payment);
  } catch (e) {
    if (e.message.includes('no encontrado') || e.message.includes('activos') || e.message.includes('pendientes')) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.get('/:paymentId', async (req, res, next) => {
  try {
    const payment = await getPaymentByIdUseCase.execute(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(payment);
  } catch (e) {
    next(e);
  }
});

router.get('/credit/:loanId', async (req, res, next) => {
  try {
    const payments = await getPaymentsByCreditUseCase.execute(req.params.loanId);
    res.json(payments);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
