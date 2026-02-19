/**
 * Risk & Scoring Context – Entidades de dominio.
 */
const Client = require('./Client');
const CreditEvaluation = require('./CreditEvaluation');
const ClientBackgroundCheck = require('./ClientBackgroundCheck');
const ExternalDebt = require('./ExternalDebt');
const CreditScoreHistory = require('./CreditScoreHistory');
const ClientCreditProfile = require('./ClientCreditProfile');

module.exports = {
  Client,
  CreditEvaluation,
  ClientBackgroundCheck,
  ExternalDebt,
  CreditScoreHistory,
  ClientCreditProfile,
};
