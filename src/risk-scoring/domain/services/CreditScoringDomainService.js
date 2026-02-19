/**
 * Servicio de dominio: lógica pura de scoring (sin I/O).
 */
class CreditScoringDomainService {
  constructor(config = {}) {
    this.minScoreApproval = config.minScoreApproval ?? 60;
    this.maxDebtToIncomeRatio = config.maxDebtToIncomeRatio ?? 0.4;
  }

  calculateScore({ monthlyIncome = 0, totalDebt = 0, onTimePayments = 0, latePayments = 0 }) {
    let score = 50;
    const income = Number(monthlyIncome);
    if (income >= 5000) score += 20;
    else if (income >= 3000) score += 15;
    else if (income >= 1500) score += 10;
    else if (income >= 800) score += 5;

    const debtToIncome = income > 0 ? Number(totalDebt) / income : 1;
    if (debtToIncome <= 0.1) score += 5;
    else if (debtToIncome <= 0.2) score += 0;
    else if (debtToIncome <= 0.3) score -= 10;
    else if (debtToIncome <= this.maxDebtToIncomeRatio) score -= 15;
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
    if (creditScore < this.minScoreApproval) {
      return { approved: false, reason: `Puntaje insuficiente (${creditScore} < ${this.minScoreApproval})` };
    }
    const newTotalDebt = Number(totalDebt) + Number(newMonthlyPayment) * 12;
    const newDebtRatio = monthlyIncome > 0 ? newTotalDebt / (monthlyIncome * 12) : 1;
    if (newDebtRatio > this.maxDebtToIncomeRatio) {
      return { approved: false, reason: 'Nivel de endeudamiento excedido' };
    }
    if (monthlyIncome < newMonthlyPayment * 1.5) {
      return { approved: false, reason: 'Cuota supera capacidad de pago' };
    }
    return { approved: true };
  }
}

module.exports = CreditScoringDomainService;
