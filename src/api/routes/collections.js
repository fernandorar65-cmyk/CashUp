const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  registerCollectionActionUseCase,
  getCollectionActionsByClientUseCase,
  getCollectionActionsByCreditUseCase,
} = require('../../container');

const router = express.Router();
router.use(authMiddleware);

router.post('/actions', [
  body('clientId').notEmpty(),
  body('actionType').isIn(['CALL', 'EMAIL', 'VISIT', 'NOTICE', 'LEGAL']),
  body('outcome').optional().isString(),
  body('note').optional().isString(),
  body('loanId').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const action = await registerCollectionActionUseCase.execute(
      {
        clientId: req.body.clientId,
        loanId: req.body.loanId,
        actionType: req.body.actionType,
        outcome: req.body.outcome,
        note: req.body.note,
      },
      req.userId
    );
    res.status(201).json(action);
  } catch (e) {
    next(e);
  }
});

router.get('/clients/:clientId/actions', async (req, res, next) => {
  try {
    const actions = await getCollectionActionsByClientUseCase.execute(req.params.clientId);
    res.json(actions);
  } catch (e) {
    next(e);
  }
});

router.get('/credits/:loanId/actions', async (req, res, next) => {
  try {
    const actions = await getCollectionActionsByCreditUseCase.execute(req.params.loanId);
    res.json(actions);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
