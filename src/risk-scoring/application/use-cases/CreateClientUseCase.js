/**
 * Caso de uso: Crear un cliente (solicitante de préstamos).
 */
class CreateClientUseCase {
  constructor({ clientRepository }) {
    this.clientRepository = clientRepository;
  }

  async execute(data) {
    const existing = await this.clientRepository.findByEmail(data.email);
    if (existing) throw new Error('Ya existe un cliente con ese correo');

    const byDoc = await this.clientRepository.findByDocumentId(data.documentId);
    if (byDoc) throw new Error('Ya existe un cliente con ese documento');

    return this.clientRepository.create({
      documentId: data.documentId,
      documentType: data.documentType || 'DNI',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      monthlyIncome: data.monthlyIncome,
      address: data.address,
    });
  }
}

module.exports = CreateClientUseCase;
