const { ClientCreditProfile } = require('../../domain/entities');

class PrismaClientCreditProfileRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new ClientCreditProfile(row).toObject();
  }

  async findByClientId(clientId) {
    const row = await this.prisma.clientCreditProfile.findUnique({
      where: { clientId },
    });
    return this._toDomain(row);
  }

  async create(data) {
    const row = await this.prisma.clientCreditProfile.create({
      data: {
        clientId: data.clientId,
        creditScore: data.creditScore,
        riskLevel: data.riskLevel,
        totalDebt: data.totalDebt ?? 0,
        onTimePayments: data.onTimePayments ?? 0,
        latePayments: data.latePayments ?? 0,
        lastCalculatedAt: data.lastCalculatedAt,
      },
    });
    return this._toDomain(row);
  }

  async update(id, data) {
    const row = await this.prisma.clientCreditProfile.update({
      where: { id },
      data,
    });
    return this._toDomain(row);
  }
}

module.exports = PrismaClientCreditProfileRepository;
