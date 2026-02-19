/**
 * Domain Service: Cálculos financieros (método francés, penalidades).
 * Lógica pura, sin I/O.
 */
class AmortizationDomainService {
  constructor(config) {
    this.config = config;
  }

  calculateMonthlyPayment(principal, annualRate, termMonths) {
    const P = Number(principal);
    const r = Number(annualRate) / 12;
    const n = Number(termMonths);

    if (n <= 0) return 0;
    if (r === 0) return P / n;

    const factor = Math.pow(1 + r, n);
    return P * (r * factor) / (factor - 1);
  }

  generateSchedule(principal, annualRate, termMonths, firstDueDate) {
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, termMonths);
    const r = Number(annualRate) / 12;
    let balance = Number(principal);
    const schedule = [];
    const startDate = new Date(firstDueDate);

    for (let i = 1; i <= termMonths; i++) {
      const interest = balance * r;
      const principalPortion = monthlyPayment - interest;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      schedule.push({
        installmentNumber: i,
        dueDate,
        principal: Math.min(principalPortion, balance),
        interest,
        latePenalty: 0,
        totalDue: monthlyPayment,
      });

      balance -= principalPortion;
      if (balance < 0.01) balance = 0;
    }

    return schedule;
  }

  calculateTotalToPay(principal, annualRate, termMonths) {
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, termMonths);
    return monthlyPayment * termMonths;
  }

  calculateLatePenalty(overdueAmount, daysLate) {
    const rate = this.config.latePenaltyRate || 0.01;
    const monthlyPenalty = Number(overdueAmount) * rate;
    const factor = Math.ceil(daysLate / 30) || 1;
    return monthlyPenalty * factor;
  }
}

module.exports = AmortizationDomainService;
