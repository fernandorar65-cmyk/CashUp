/**
 * Entidades de dominio (modelos por tabla).
 * Capa Domain: sin dependencias de Prisma ni infraestructura.
 */

const Client = require('./Client');
const User = require('./User');
const Role = require('./Role');
const PenaltyPolicy = require('./PenaltyPolicy');
const CreditEvaluation = require('./CreditEvaluation');
const Loan = require('./Loan');
const LoanRefinance = require('./LoanRefinance');
const Installment = require('./Installment');
const Payment = require('./Payment');
const PaymentApplication = require('./PaymentApplication');
const LateFee = require('./LateFee');
const LoanCharge = require('./LoanCharge');
const CollectionAction = require('./CollectionAction');
const LoanHistory = require('./LoanHistory');
const ClientBackgroundCheck = require('./ClientBackgroundCheck');
const ExternalDebt = require('./ExternalDebt');
const CreditScoreHistory = require('./CreditScoreHistory');
const ClientCreditProfile = require('./ClientCreditProfile');
const UserRole = require('./UserRole');
const AuditLog = require('./AuditLog');

const enums = require('./enums');

module.exports = {
  Client,
  User,
  Role,
  PenaltyPolicy,
  CreditEvaluation,
  Loan,
  LoanRefinance,
  Installment,
  Payment,
  PaymentApplication,
  LateFee,
  LoanCharge,
  CollectionAction,
  LoanHistory,
  ClientBackgroundCheck,
  ExternalDebt,
  CreditScoreHistory,
  ClientCreditProfile,
  UserRole,
  AuditLog,
  enums,
};
