/**
 * Credit Management Context – Entidades de dominio.
 */
const Loan = require('./Loan');
const Installment = require('./Installment');
const LoanRefinance = require('./LoanRefinance');
const LoanCharge = require('./LoanCharge');
const LoanHistory = require('./LoanHistory');
const PenaltyPolicy = require('./PenaltyPolicy');
const LateFee = require('./LateFee');

module.exports = {
  Loan,
  Installment,
  LoanRefinance,
  LoanCharge,
  LoanHistory,
  PenaltyPolicy,
  LateFee,
};
