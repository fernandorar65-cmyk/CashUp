/**
 * Enums de dominio (independientes de Prisma).
 * Coinciden con los valores del schema para persistencia.
 */

const ClientStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
});

const LoanStatus = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  PAID: 'PAID',
  DEFAULTED: 'DEFAULTED',
  REFINANCED: 'REFINANCED',
});

const InterestType = Object.freeze({
  SIMPLE: 'SIMPLE',
  COMPOUND: 'COMPOUND',
});

const InstallmentStatus = Object.freeze({
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
});

const ChargeType = Object.freeze({
  COMMISSION: 'COMMISSION',
  INSURANCE: 'INSURANCE',
  ADMIN_FEE: 'ADMIN_FEE',
  OTHER: 'OTHER',
});

const PenaltyCalculationType = Object.freeze({
  PERCENTAGE_ON_BALANCE: 'PERCENTAGE_ON_BALANCE',
  PERCENTAGE_ON_OVERDUE: 'PERCENTAGE_ON_OVERDUE',
  FLAT_DAILY: 'FLAT_DAILY',
});

const CollectionActionType = Object.freeze({
  CALL: 'CALL',
  EMAIL: 'EMAIL',
  VISIT: 'VISIT',
  NOTICE: 'NOTICE',
  LEGAL: 'LEGAL',
});

const CreditEvaluationResult = Object.freeze({
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

const BackgroundCheckType = Object.freeze({
  JUDICIAL: 'JUDICIAL',
  RISK_LIST: 'RISK_LIST',
  EXTERNAL_VALIDATION: 'EXTERNAL_VALIDATION',
});

const BackgroundCheckResult = Object.freeze({
  PASS: 'PASS',
  FAIL: 'FAIL',
  PENDING: 'PENDING',
});

const UserStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
});

module.exports = {
  ClientStatus,
  LoanStatus,
  InterestType,
  InstallmentStatus,
  ChargeType,
  PenaltyCalculationType,
  CollectionActionType,
  CreditEvaluationResult,
  BackgroundCheckType,
  BackgroundCheckResult,
  UserStatus,
};
