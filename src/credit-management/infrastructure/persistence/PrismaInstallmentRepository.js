const { Installment } = require('../../domain/entities');

class PrismaInstallmentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new Installment(row).toObject();
  }

  async createMany(loanId, items) {
    const created = [];
    for (const item of items) {
      const row = await this.prisma.installment.create({
        data: {
          loanId,
          installmentNumber: item.installmentNumber,
          dueDate: item.dueDate,
          principal: item.principal,
          interest: item.interest,
          totalDue: item.totalDue,
        },
      });
      created.push(this._toDomain(row));
    }
    return created;
  }

  async findByLoanId(loanId) {
    const rows = await this.prisma.installment.findMany({
      where: { loanId },
      orderBy: { installmentNumber: 'asc' },
    });
    return rows.map((r) => this._toDomain(r));
  }

  async update(id, data) {
    const row = await this.prisma.installment.update({
      where: { id },
      data,
    });
    return this._toDomain(row);
  }
}

module.exports = PrismaInstallmentRepository;
