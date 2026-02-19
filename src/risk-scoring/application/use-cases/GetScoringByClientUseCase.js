/**
 * Caso de uso: Obtener puntaje / perfil de scoring de un cliente.
 */
class GetScoringByClientUseCase {
  constructor({ clientRepository, creditProfileRepository }) {
    this.clientRepository = clientRepository;
    this.creditProfileRepository = creditProfileRepository;
  }

  async execute(clientId) {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error('Cliente no encontrado');

    const profile = await this.creditProfileRepository.findByClientId(clientId);
    return { client, profile: profile || null };
  }
}

module.exports = GetScoringByClientUseCase;
