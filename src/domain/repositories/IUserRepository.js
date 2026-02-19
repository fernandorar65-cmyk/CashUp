/**
 * Repository interface (port) - Domain layer
 * La infraestructura implementa esta interfaz
 */
class IUserRepository {
  async findById(id) {
    throw new Error('Not implemented');
  }

  async findByEmail(email) {
    throw new Error('Not implemented');
  }

  async findByDocumentId(documentId) {
    throw new Error('Not implemented');
  }

  async findFirstByEmailOrDocument(email, documentId) {
    throw new Error('Not implemented');
  }

  async create(data) {
    throw new Error('Not implemented');
  }
}

module.exports = IUserRepository;
