const { toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (IAM): Asignación usuario–rol (N:N).
 */
class UserRole {
  constructor(data = {}) {
    this.userId = data.userId ?? data.user_id ?? null;
    this.roleId = data.roleId ?? data.role_id ?? null;
    this.assignedAt = toDate(data.assignedAt ?? data.assigned_at);
    this.assignedById = data.assignedById ?? data.assigned_by_id ?? null;
  }

  toObject() {
    return { ...this };
  }
}

module.exports = UserRole;
