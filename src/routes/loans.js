const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  requestLoanUseCase,
  disburseLoanUseCase,
  recordPaymentUseCase,
  getLoansUseCase,
  getLoanByIdUseCase,
  getCreditProfileUseCase,
} = require('../container');

const router = express.Router();
router.use(authMiddleware);

const requestLoanValidation = [
  body('amount').isFloat({ min: 100, max: 50000 }),
  body('termMonths').isInt({ min: 1, max: 36 }),
];

router.post(
  '/request',
  requestLoanValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const result = await requestLoanUseCase.execute(req.userId, req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post('/:loanId/disburse', async (req, res, next) => {
  try {
    const loan = await disburseLoanUseCase.execute(req.params.loanId, req.userId);
    res.json(loan);
  } catch (e) {
    if (e.message.includes('no encontrado') || e.message.includes('aprobados')) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const loans = await getLoansUseCase.execute(req.userId, req.query.status || undefined);
    res.json(loans);
  } catch (e) {
    next(e);
  }
});

router.get('/profile', async (req, res, next) => {
  try {
    const profile = await getCreditProfileUseCase.execute(req.userId);
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

router.get('/:loanId', async (req, res, next) => {
  try {
    const loan = await getLoanByIdUseCase.execute(req.params.loanId, req.userId);
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });
    res.json(loan);
  } catch (e) {
    next(e);
  }
});

const paymentValidation = [
  body('amount').isFloat({ min: 0.01 }),
  body('itemId').optional().isString(),
];

router.post('/:loanId/payments', paymentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const loan = await recordPaymentUseCase.execute(
      req.userId,
      req.params.loanId,
      req.body.amount,
      req.body.itemId
    );
    res.json(loan);
  } catch (e) {
    if (e.message.includes('no encontrado') || e.message.includes('activos') || e.message.includes('pendientes')) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
});

module.exports = router;
