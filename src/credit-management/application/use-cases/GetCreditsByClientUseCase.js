/**
 * Caso de uso: Listar préstamos de un cliente.
 */
class GetCreditsByClientUseCase {
  constructor({ loanRepository }) {
    this.loanRepository = loanRepository;
  }

  async execute(clientId, status = null) {
    return this.loanRepository.findByClientId(clientId, { status });
  }
}

module.exports = GetCreditsByClientUseCase;
