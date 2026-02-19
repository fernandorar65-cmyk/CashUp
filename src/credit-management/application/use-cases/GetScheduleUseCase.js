/**
 * Caso de uso: Obtener cronograma de cuotas de un préstamo.
 */
class GetScheduleUseCase {
  constructor({ loanRepository, installmentRepository }) {
    this.loanRepository = loanRepository;
    this.installmentRepository = installmentRepository;
  }

  async execute(creditId, clientId = null) {
    const loan = await this.loanRepository.findById(creditId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (clientId && loan.clientId !== clientId) throw new Error('Préstamo no encontrado');

    const installments = await this.installmentRepository.findByLoanId(creditId);
    return { loan, schedule: installments };
  }
}

module.exports = GetScheduleUseCase;
