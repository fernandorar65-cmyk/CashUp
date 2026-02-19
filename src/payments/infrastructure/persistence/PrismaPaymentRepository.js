const { Payment } = require('../../domain/entities');

class PrismaPaymentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new Payment(row).toObject();
  }

  async create(data) {
    const row = await this.prisma.payment.create({
      data: {
        clientId: data.clientId,
        loanId: data.loanId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        paidAt: data.paidAt,
        createdById: data.createdById,
      },
    });
    return this._toDomain(row);
  }

  async createApplication(data) {
    await this.prisma.paymentApplication.create({
      data: {
        paymentId: data.paymentId,
        installmentId: data.installmentId,
        amountApplied: data.amountApplied,
        appliedToPrincipal: data.appliedToPrincipal,
        appliedToInterest: data.appliedToInterest,
        appliedToLateFee: data.appliedToLateFee,
      },
    });
  }

  async findById(id) {
    const row = await this.prisma.payment.findUnique({
      where: { id },
      include: { applications: true },
    });
    return row ? this._toDomain(row) : null;
  }

  async findByLoanId(loanId) {
    const rows = await this.prisma.payment.findMany({
      where: { loanId },
      orderBy: { paidAt: 'desc' },
    });
    return rows.map((r) => this._toDomain(r));
  }

  async findByClientId(clientId) {
    const rows = await this.prisma.payment.findMany({
      where: { clientId },
      orderBy: { paidAt: 'desc' },
    });
    return rows.map((r) => this._toDomain(r));
  }
}

module.exports = PrismaPaymentRepository;
