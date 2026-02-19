/**
 * Cálculo de cuotas y cronograma de amortización (método francés).
 * Incluye soporte para penalidades por mora.
 */

const config = require('../config');

/**
 * Calcula la cuota mensual (método francés).
 * PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
 * @param {number} principal - Monto del préstamo
 * @param {number} annualRate - Tasa de interés anual (ej: 0.24 = 24%)
 * @param {number} termMonths - Número de cuotas
 * @returns {number} Cuota mensual
 */
function calculateMonthlyPayment(principal, annualRate, termMonths) {
  const P = Number(principal);
  const r = Number(annualRate) / 12;
  const n = Number(termMonths);

  if (n <= 0) return 0;
  if (r === 0) return P / n;

  const factor = Math.pow(1 + r, n);
  return P * (r * factor) / (factor - 1);
}

/**
 * Genera el cronograma de amortización completo.
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} termMonths
 * @param {Date} firstDueDate - Fecha de vencimiento de la primera cuota
 * @returns {Array<{ installmentNumber, dueDate, principal, interest, totalDue }>}
 */
function generateSchedule(principal, annualRate, termMonths, firstDueDate) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const r = Number(annualRate) / 12;
  let balance = Number(principal);
  const schedule = [];
  const startDate = new Date(firstDueDate);

  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * r;
    const principalPortion = monthlyPayment - interest;
    const totalDue = monthlyPayment;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i - 1);

    schedule.push({
      installmentNumber: i,
      dueDate,
      principal: Math.min(principalPortion, balance),
      interest,
      latePenalty: 0,
      totalDue,
    });

    balance -= principalPortion;
    if (balance < 0.01) balance = 0;
  }

  return schedule;
}

/**
 * Calcula el monto total a pagar (principal + intereses).
 */
function calculateTotalToPay(principal, annualRate, termMonths) {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  return monthlyPayment * termMonths;
}

/**
 * Calcula penalidad por mora (por día o por cuota, según política).
 * Por defecto: porcentaje mensual sobre saldo o cuota vencida.
 * @param {number} overdueAmount - Monto vencido
 * @param {number} daysLate - Días de mora
 * @returns {number} Monto de penalidad
 */
function calculateLatePenalty(overdueAmount, daysLate) {
  const rate = config.creditScoring.latePenaltyRate || 0.01;
  const monthlyPenalty = Number(overdueAmount) * rate;
  const factor = Math.ceil(daysLate / 30) || 1;
  return monthlyPenalty * factor;
}

module.exports = {
  calculateMonthlyPayment,
  generateSchedule,
  calculateTotalToPay,
  calculateLatePenalty,
};
