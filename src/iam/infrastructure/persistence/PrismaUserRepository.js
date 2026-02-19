const { User } = require('../../domain/entities');

class PrismaUserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(data) {
    const row = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    return this._toDomain(row);
  }

  async findById(id) {
    const row = await this.prisma.user.findUnique({
      where: { id },
    });
    return row ? this._toDomain(row) : null;
  }

  async findByEmail(email) {
    const row = await this.prisma.user.findUnique({
      where: { email },
    });
    return row ? this._toDomain(row) : null;
  }

  async update(id, data) {
    const row = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this._toDomain(row);
  }

  _toDomain(row) {
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      firstName: row.firstName,
      lastName: row.lastName,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    }).toObject();
  }
}

module.exports = PrismaUserRepository;
