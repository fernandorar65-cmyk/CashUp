class DisburseLoanUseCase {
  constructor({ loanRepository, amortizationService }) {
    this.loanRepository = loanRepository;
    this.amortizationService = amortizationService;
  }

  async execute(loanId, userId) {
    const loan = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (loan.status !== 'APPROVED') throw new Error('Solo se pueden desembolsar préstamos aprobados');

    const firstDueDate = new Date();
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    firstDueDate.setDate(1);

    const schedule = this.amortizationService.generateSchedule(
      loan.amount,
      Number(loan.interestRate),
      loan.termMonths,
      firstDueDate
    );

    const dueDate = schedule.length > 0 ? schedule[schedule.length - 1].dueDate : null;

    return this.loanRepository.disburseLoan(loanId, schedule, dueDate);
  }
}

module.exports = DisburseLoanUseCase;
