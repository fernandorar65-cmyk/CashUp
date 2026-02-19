const { PrismaClient } = require('@prisma/client');

class PrismaLoanRepository {
  constructor(prisma = new PrismaClient()) {
    this.prisma = prisma;
  }

  async findByIdAndUser(loanId, userId) {
    return this.prisma.loan.findFirst({
      where: { id: loanId, userId },
      include: { schedule: true, user: { include: { creditProfile: true } } },
    });
  }

  async findByUser(userId, status) {
    const where = { userId };
    if (status) where.status = status;
    return this.prisma.loan.findMany({
      where,
      include: { schedule: { orderBy: { installmentNumber: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalActiveDebtByUser(userId) {
    const result = await this.prisma.loan.aggregate({
      where: { userId, status: { in: ['ACTIVE', 'APPROVED'] } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async create(data) {
    return this.prisma.loan.create({ data });
  }

  async update(id, data) {
    return this.prisma.loan.update({ where: { id }, data });
  }

  async createAmortizationItems(loanId, items) {
    return Promise.all(
      items.map((item) =>
        this.prisma.amortizationItem.create({
          data: {
            loanId,
            installmentNumber: item.installmentNumber,
            dueDate: item.dueDate,
            principal: item.principal,
            interest: item.interest,
            totalDue: item.totalDue,
          },
        })
      )
    );
  }

  async updateAmortizationItem(id, data) {
    return this.prisma.amortizationItem.update({
      where: { id },
      data,
    });
  }

  async createPayment(data) {
    return this.prisma.payment.create({ data });
  }

  async findLoanWithScheduleAndPayments(loanId, userId) {
    return this.prisma.loan.findFirst({
      where: { id: loanId, userId },
      include: {
        schedule: { orderBy: { installmentNumber: 'asc' } },
        payments: true,
      },
    });
  }

  async transaction(fn) {
    return this.prisma.$transaction(fn);
  }

  async disburseLoan(loanId, schedule, dueDate) {
    return this.prisma.$transaction(async (tx) => {
      await tx.loan.update({
        where: { id: loanId },
        data: { status: 'ACTIVE', disbursedAt: new Date(), dueDate },
      });
      for (const item of schedule) {
        await tx.amortizationItem.create({
          data: {
            loanId,
            installmentNumber: item.installmentNumber,
            dueDate: item.dueDate,
            principal: item.principal,
            interest: item.interest,
            totalDue: item.totalDue,
          },
        });
      }
      return tx.loan.findUnique({
        where: { id: loanId },
        include: { schedule: { orderBy: { installmentNumber: 'asc' } } },
      });
    });
  }
}

module.exports = PrismaLoanRepository;
