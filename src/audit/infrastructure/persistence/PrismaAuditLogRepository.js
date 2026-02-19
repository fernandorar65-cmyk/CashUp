class PrismaAuditLogRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(data) {
    const row = await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
    return {
      id: row.id,
      userId: row.userId,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt,
    };
  }
}

module.exports = PrismaAuditLogRepository;
