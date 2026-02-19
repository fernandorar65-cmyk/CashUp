/**
 * Caso de uso: Obtener detalle de un préstamo (por id y opcionalmente por cliente).
 */
class GetCreditByIdUseCase {
  constructor({ loanRepository }) {
    this.loanRepository = loanRepository;
  }

  async execute(creditId, clientId = null) {
    const loan = await this.loanRepository.findById(creditId);
    if (!loan) return null;
    if (clientId && loan.clientId !== clientId) return null;
    return loan;
  }
}

module.exports = GetCreditByIdUseCase;
