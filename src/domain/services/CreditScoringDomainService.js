/**
 * Domain Service: Lógica pura de credit scoring.
 * Sin dependencias de infraestructura.
 */
class CreditScoringDomainService {
  constructor(config) {
    this.config = config;
  }

  calculateScore({ monthlyIncome, totalDebt = 0, onTimePayments = 0, latePayments = 0 }) {
    let score = 50;
    if (monthlyIncome >= 5000) score += 20;
    else if (monthlyIncome >= 3000) score += 15;
    else if (monthlyIncome >= 1500) score += 10;
    else if (monthlyIncome >= 800) score += 5;

    const debtToIncome = monthlyIncome > 0 ? totalDebt / monthlyIncome : 1;
    if (debtToIncome <= 0.1) score += 5;
    else if (debtToIncome <= 0.2) score += 0;
    else if (debtToIncome <= 0.3) score -= 10;
    else if (debtToIncome <= this.config.maxDebtToIncomeRatio) score -= 15;
    else score -= 25;

    const totalPayments = onTimePayments + latePayments;
    if (totalPayments > 0) {
      const onTimeRatio = onTimePayments / totalPayments;
      if (onTimeRatio >= 0.95) score += 25;
      else if (onTimeRatio >= 0.8) score += 10;
      else if (onTimeRatio >= 0.6) score -= 5;
      else score -= 25;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  evaluateApproval(creditScore, monthlyIncome, totalDebt, newMonthlyPayment) {
    if (creditScore < this.config.minScoreApproval) {
      return { approved: false, reason: `Puntaje crediticio insuficiente (${creditScore} < ${this.config.minScoreApproval})` };
    }

    const newTotalDebt = Number(totalDebt) + Number(newMonthlyPayment) * 12;
    const newDebtRatio = monthlyIncome > 0 ? newTotalDebt / (monthlyIncome * 12) : 1;
    if (newDebtRatio > this.config.maxDebtToIncomeRatio) {
      return { approved: false, reason: 'El nuevo préstamo excedería el nivel de endeudamiento permitido' };
    }

    if (monthlyIncome < newMonthlyPayment * 1.5) {
      return { approved: false, reason: 'La cuota mensual supera la capacidad de pago recomendada' };
    }

    return { approved: true };
  }

  updateScoreAfterPayment(currentScore, wasOnTime, onTimePayments, latePayments) {
    const total = onTimePayments + latePayments;
    if (total === 0) return currentScore;

    const onTimeRatio = onTimePayments / total;
    const delta = wasOnTime ? (onTimeRatio >= 0.9 ? 2 : 3) : -5;
    return Math.max(0, Math.min(100, currentScore + delta));
  }
}

module.exports = CreditScoringDomainService;
