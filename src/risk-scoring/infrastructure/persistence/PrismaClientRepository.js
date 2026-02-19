const { Client } = require('../../domain/entities');

class PrismaClientRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new Client(row).toObject();
  }

  async create(data) {
    const row = await this.prisma.client.create({
      data: {
        documentId: data.documentId,
        documentType: data.documentType,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        monthlyIncome: data.monthlyIncome,
        address: data.address,
      },
    });
    return this._toDomain(row);
  }

  async findById(id) {
    const row = await this.prisma.client.findUnique({ where: { id } });
    return this._toDomain(row);
  }

  async findByEmail(email) {
    const row = await this.prisma.client.findUnique({ where: { email } });
    return this._toDomain(row);
  }

  async findByDocumentId(documentId) {
    const row = await this.prisma.client.findUnique({ where: { documentId } });
    return this._toDomain(row);
  }
}

module.exports = PrismaClientRepository;
