/**
 * Caso de uso: Registrar una gestión de cobranza.
 */
class RegisterCollectionActionUseCase {
  constructor({ collectionActionRepository }) {
    this.collectionActionRepository = collectionActionRepository;
  }

  async execute({ clientId, loanId, actionType, outcome, note }, createdById = null) {
    return this.collectionActionRepository.create({
      clientId,
      loanId: loanId || null,
      actionType,
      outcome,
      note,
      actionDate: new Date(),
      createdById,
    });
  }
}

module.exports = RegisterCollectionActionUseCase;
