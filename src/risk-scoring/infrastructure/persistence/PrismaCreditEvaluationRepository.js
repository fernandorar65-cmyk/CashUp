const { CreditEvaluation } = require('../../domain/entities');

class PrismaCreditEvaluationRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new CreditEvaluation(row).toObject();
  }

  async create(data) {
    const row = await this.prisma.creditEvaluation.create({
      data: {
        clientId: data.clientId,
        score: data.score,
        result: data.result,
        factors: data.factors,
        evaluatedAt: data.evaluatedAt,
        evaluatedById: data.evaluatedById,
      },
    });
    return this._toDomain(row);
  }

  async findById(id) {
    const row = await this.prisma.creditEvaluation.findUnique({ where: { id } });
    return this._toDomain(row);
  }
}

module.exports = PrismaCreditEvaluationRepository;
