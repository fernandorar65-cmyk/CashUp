const { CollectionAction } = require('../../domain/entities');

class PrismaCollectionActionRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  _toDomain(row) {
    if (!row) return null;
    return new CollectionAction(row).toObject();
  }

  async create(data) {
    const row = await this.prisma.collectionAction.create({
      data: {
        clientId: data.clientId,
        loanId: data.loanId,
        actionType: data.actionType,
        outcome: data.outcome,
        note: data.note,
        actionDate: data.actionDate,
        createdById: data.createdById,
      },
    });
    return this._toDomain(row);
  }

  async findByClientId(clientId) {
    const rows = await this.prisma.collectionAction.findMany({
      where: { clientId },
      orderBy: { actionDate: 'desc' },
    });
    return rows.map((r) => this._toDomain(r));
  }

  async findByLoanId(loanId) {
    const rows = await this.prisma.collectionAction.findMany({
      where: { loanId },
      orderBy: { actionDate: 'desc' },
    });
    return rows.map((r) => this._toDomain(r));
  }
}

module.exports = PrismaCollectionActionRepository;
