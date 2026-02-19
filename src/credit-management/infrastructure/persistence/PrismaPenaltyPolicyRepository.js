const { PenaltyPolicy } = require('../../domain/entities');

class PrismaPenaltyPolicyRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new PenaltyPolicy(row).toObject();
  }

  async findById(id) {
    const row = await this.prisma.penaltyPolicy.findUnique({
      where: { id },
    });
    return this._toDomain(row);
  }

  async getDefault() {
    const row = await this.prisma.penaltyPolicy.findFirst({
      where: { isDefault: true },
    });
    return this._toDomain(row);
  }
}

module.exports = PrismaPenaltyPolicyRepository;
