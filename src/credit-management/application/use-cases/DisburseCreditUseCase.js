/**
 * Caso de uso: Desembolsar un préstamo aprobado (generar cuotas y marcar ACTIVE).
 */
class DisburseCreditUseCase {
  constructor({ loanRepository, installmentRepository, amortizationService }) {
    this.loanRepository = loanRepository;
    this.installmentRepository = installmentRepository;
    this.amortizationService = amortizationService;
  }

  async execute(creditId) {
    const loan = await this.loanRepository.findById(creditId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (loan.status !== 'APPROVED') throw new Error('Solo se pueden desembolsar préstamos aprobados');

    const firstDueDate = new Date();
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    firstDueDate.setDate(1);

    const schedule = this.amortizationService.generateSchedule(
      loan.amount,
      loan.interestRate,
      loan.termMonths,
      firstDueDate
    );

    await this.loanRepository.update(creditId, {
      status: 'ACTIVE',
      disbursedAt: new Date(),
      dueDate: schedule.length ? schedule[schedule.length - 1].dueDate : null,
    });

    await this.installmentRepository.createMany(creditId, schedule);
    return this.loanRepository.findById(creditId);
  }
}

module.exports = DisburseCreditUseCase;
