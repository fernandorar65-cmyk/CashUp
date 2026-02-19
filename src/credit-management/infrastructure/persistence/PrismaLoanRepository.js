const { Loan } = require('../../domain/entities');

class PrismaLoanRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new Loan(row).toObject();
  }

  async create(data) {
    const row = await this.prisma.loan.create({
      data: {
        clientId: data.clientId,
        amount: data.amount,
        termMonths: data.termMonths,
        interestRate: data.interestRate,
        interestType: data.interestType ?? 'SIMPLE',
        monthlyPayment: data.monthlyPayment,
        totalToPay: data.totalToPay,
        status: data.status ?? 'PENDING',
        penaltyPolicyId: data.penaltyPolicyId,
        creditEvaluationId: data.creditEvaluationId,
        rejectionReason: data.rejectionReason,
        approvedAt: data.approvedAt,
        approvedById: data.approvedById,
      },
    });
    return this._toDomain(row);
  }

  async findById(id) {
    const row = await this.prisma.loan.findUnique({
      where: { id },
    });
    return this._toDomain(row);
  }

  async findByClientId(clientId, options = {}) {
    const where = { clientId };
    if (options.status) where.status = options.status;
    const rows = await this.prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this._toDomain(r));
  }

  async update(id, data) {
    const row = await this.prisma.loan.update({
      where: { id },
      data,
    });
    return this._toDomain(row);
  }

  async getTotalActiveDebtByClientId(clientId) {
    const result = await this.prisma.loan.aggregate({
      where: {
        clientId,
        status: { in: ['ACTIVE', 'APPROVED'] },
      },
      _sum: { amount: true },
    });
    return Number(result._sum?.amount ?? 0);
  }
}

module.exports = PrismaLoanRepository;
