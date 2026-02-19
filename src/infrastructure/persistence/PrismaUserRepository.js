const { PrismaClient } = require('@prisma/client');

class PrismaUserRepository {
  constructor(prisma = new PrismaClient()) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { creditProfile: true },
    });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { creditProfile: true },
    });
  }

  async findByDocumentId(documentId) {
    return this.prisma.user.findUnique({ where: { documentId } });
  }

  async findFirstByEmailOrDocument(email, documentId) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { documentId }] },
    });
  }

  async create(data) {
    return this.prisma.user.create({
      data,
      select: { id: true, email: true, firstName: true, lastName: true, documentId: true, monthlyIncome: true, createdAt: true },
    });
  }
}

module.exports = PrismaUserRepository;
