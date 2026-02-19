const { PrismaClient } = require('@prisma/client');

class PrismaCreditProfileRepository {
  constructor(prisma = new PrismaClient()) {
    this.prisma = prisma;
  }

  async findByUserId(userId) {
    return this.prisma.creditProfile.findUnique({
      where: { userId },
    });
  }

  async create(data) {
    return this.prisma.creditProfile.create({ data });
  }

  async update(id, data) {
    return this.prisma.creditProfile.update({
      where: { id },
      data,
    });
  }
}

module.exports = PrismaCreditProfileRepository;
