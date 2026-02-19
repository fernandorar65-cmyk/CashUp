/**
 * Caso de uso: Listar gestiones de cobranza por préstamo.
 */
class GetCollectionActionsByCreditUseCase {
  constructor({ collectionActionRepository }) {
    this.collectionActionRepository = collectionActionRepository;
  }

  async execute(loanId) {
    return this.collectionActionRepository.findByLoanId(loanId);
  }
}

module.exports = GetCollectionActionsByCreditUseCase;
