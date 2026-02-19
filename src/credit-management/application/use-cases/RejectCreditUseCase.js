/**
 * Caso de uso: Rechazar un préstamo.
 */
class RejectCreditUseCase {
  constructor({ loanRepository }) {
    this.loanRepository = loanRepository;
  }

  async execute(creditId, reason) {
    const loan = await this.loanRepository.findById(creditId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (loan.status !== 'PENDING') throw new Error('Solo se pueden rechazar préstamos pendientes');

    return this.loanRepository.update(creditId, {
      status: 'REJECTED',
      rejectionReason: reason || null,
    });
  }
}

module.exports = RejectCreditUseCase;
