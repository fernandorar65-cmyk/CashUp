/**
 * Caso de uso: Simular un crédito (cuota, total) sin persistir.
 */
class SimulateCreditUseCase {
  constructor({ amortizationService }) {
    this.amortizationService = amortizationService;
  }

  async execute({ amount, termMonths, annualRate }) {
    const principal = Number(amount);
    const rate = Number(annualRate);
    const term = Number(termMonths);

    const monthlyPayment = this.amortizationService.calculateMonthlyPayment(principal, rate, term);
    const totalToPay = this.amortizationService.calculateTotalToPay(principal, rate, term);
    const firstDueDate = new Date();
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    const schedule = this.amortizationService.generateSchedule(principal, rate, term, firstDueDate);

    return {
      amount: principal,
      termMonths: term,
      annualRate: rate,
      monthlyPayment,
      totalToPay,
      schedule,
    };
  }
}

module.exports = SimulateCreditUseCase;
