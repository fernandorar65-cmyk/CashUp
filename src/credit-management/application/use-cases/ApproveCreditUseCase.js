/**
 * Caso de uso: Aprobar un préstamo (cambiar estado a APPROVED).
 */
class ApproveCreditUseCase {
  constructor({ loanRepository }) {
    this.loanRepository = loanRepository;
  }

  async execute(creditId, approvedById) {
    const loan = await this.loanRepository.findById(creditId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (loan.status !== 'PENDING') throw new Error('Solo se pueden aprobar préstamos pendientes');

    return this.loanRepository.update(creditId, {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById,
      rejectionReason: null,
    });
  }
}

module.exports = ApproveCreditUseCase;
