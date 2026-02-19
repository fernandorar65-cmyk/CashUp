require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'cashup-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  creditScoring: {
    minScoreApproval: Number(process.env.MIN_CREDIT_SCORE_APPROVAL) || 60,
    maxDebtToIncomeRatio: Number(process.env.MAX_DEBT_TO_INCOME_RATIO) || 0.4,
    defaultInterestRate: Number(process.env.DEFAULT_INTEREST_RATE) || 0.02,
    latePenaltyRate: Number(process.env.LATE_PENALTY_RATE) || 0.01,
  },
};
