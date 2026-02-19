const { toDate } = require('./helpers');

/**
 * Entidad de dominio: Registro de auditoría.
 */
class AuditLog {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.userId = data.userId ?? data.user_id ?? null;
    this.action = data.action ?? null;
    this.entityType = data.entityType ?? data.entity_type ?? null;
    this.entityId = data.entityId ?? data.entity_id ?? null;
    this.oldValues = data.oldValues ?? data.old_values ?? null;
    this.newValues = data.newValues ?? data.new_values ?? null;
    this.ipAddress = data.ipAddress ?? data.ip_address ?? null;
    this.userAgent = data.userAgent ?? data.user_agent ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = AuditLog;
