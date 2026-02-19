/**
 * Servicio de Credit Scoring dinámico.
 * Evalúa riesgo según: ingresos, nivel de endeudamiento y comportamiento de pago.
 */

const config = require('../config');

/**
 * Calcula el puntaje crediticio (0-100) del usuario.
 * @param {Object} params
 * @param {number} params.monthlyIncome - Ingreso mensual
 * @param {number} params.totalDebt - Deuda total actual
 * @param {number} params.onTimePayments - Pagos a tiempo históricos
 * @param {number} params.latePayments - Pagos en mora históricos
 * @returns {number} Puntaje 0-100
 */
function calculateCreditScore({ monthlyIncome, totalDebt = 0, onTimePayments = 0, latePayments = 0 }) {
  let score = 50; // Base

  // Factor ingreso (hasta +20): ingresos mayores mejoran el score
  if (monthlyIncome >= 5000) score += 20;
  else if (monthlyIncome >= 3000) score += 15;
  else if (monthlyIncome >= 1500) score += 10;
  else if (monthlyIncome >= 800) score += 5;

  // Factor endeudamiento (hasta -25): ratio deuda/ingreso
  const debtToIncome = monthlyIncome > 0 ? totalDebt / monthlyIncome : 1;
  if (debtToIncome <= 0.1) score += 5;
  else if (debtToIncome <= 0.2) score += 0;
  else if (debtToIncome <= 0.3) score -= 10;
  else if (debtToIncome <= config.creditScoring.maxDebtToIncomeRatio) score -= 15;
  else score -= 25;

  // Factor comportamiento de pago (hasta ±25)
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

/**
 * Evalúa si un préstamo debe aprobarse o rechazarse.
 * @param {number} creditScore
 * @param {number} requestedAmount
 * @param {number} monthlyIncome
 * @param {number} totalDebt
 * @param {number} newMonthlyPayment - Cuota que generaría el nuevo préstamo
 * @returns {{ approved: boolean, reason?: string }}
 */
function evaluateLoanApproval(creditScore, requestedAmount, monthlyIncome, totalDebt, newMonthlyPayment) {
  const minScore = config.creditScoring.minScoreApproval;
  if (creditScore < minScore) {
    return { approved: false, reason: `Puntaje crediticio insuficiente (${creditScore} < ${minScore})` };
  }

  const currentDebtRatio = monthlyIncome > 0 ? totalDebt / monthlyIncome : 1;
  const newTotalDebt = Number(totalDebt) + Number(newMonthlyPayment) * 12; // aproximado
  const newDebtRatio = monthlyIncome > 0 ? newTotalDebt / (monthlyIncome * 12) : 1;

  if (newDebtRatio > config.creditScoring.maxDebtToIncomeRatio) {
    return { approved: false, reason: 'El nuevo préstamo excedería el nivel de endeudamiento permitido' };
  }

  if (monthlyIncome < newMonthlyPayment * 1.5) {
    return { approved: false, reason: 'La cuota mensual supera la capacidad de pago recomendada' };
  }

  return { approved: true };
}

/**
 * Actualiza el puntaje crediticio tras un pago (a tiempo o en mora).
 * @param {number} currentScore
 * @param {boolean} wasOnTime
 * @param {number} onTimePayments
 * @param {number} latePayments
 * @returns {number} Nuevo puntaje
 */
function updateScoreAfterPayment(currentScore, wasOnTime, onTimePayments, latePayments) {
  const total = onTimePayments + latePayments;
  if (total === 0) return currentScore;

  const onTimeRatio = onTimePayments / total;
  let delta = 0;
  if (wasOnTime) {
    delta = onTimeRatio >= 0.9 ? 2 : 3;
  } else {
    delta = -5;
  }
  return Math.max(0, Math.min(100, currentScore + delta));
}

module.exports = {
  calculateCreditScore,
  evaluateLoanApproval,
  updateScoreAfterPayment,
};
