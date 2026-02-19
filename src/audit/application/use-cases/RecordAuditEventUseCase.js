/**
 * Caso de uso: Registrar un evento de auditoría.
 */
class RecordAuditEventUseCase {
  constructor({ auditLogRepository }) {
    this.auditLogRepository = auditLogRepository;
  }

  async execute({ userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent }) {
    return this.auditLogRepository.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }
}

module.exports = RecordAuditEventUseCase;
