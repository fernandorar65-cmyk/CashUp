/**
 * Caso de uso: Listar gestiones de cobranza por cliente.
 */
class GetCollectionActionsByClientUseCase {
  constructor({ collectionActionRepository }) {
    this.collectionActionRepository = collectionActionRepository;
  }

  async execute(clientId) {
    return this.collectionActionRepository.findByClientId(clientId);
  }
}

module.exports = GetCollectionActionsByClientUseCase;
