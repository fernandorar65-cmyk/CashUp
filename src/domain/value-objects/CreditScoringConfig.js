/**
 * Value Object: Configuración del credit scoring (reglas de negocio)
 */
class CreditScoringConfig {
  constructor({
    minScoreApproval = 60,
    maxDebtToIncomeRatio = 0.4,
    defaultInterestRate = 0.02,
    latePenaltyRate = 0.01,
  } = {}) {
    this.minScoreApproval = minScoreApproval;
    this.maxDebtToIncomeRatio = maxDebtToIncomeRatio;
    this.defaultInterestRate = defaultInterestRate;
    this.latePenaltyRate = latePenaltyRate;
  }
}

module.exports = CreditScoringConfig;
