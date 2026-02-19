const { toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (IAM): Usuario del sistema (staff: admin, analista, cobrador).
 */
class User {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.email = data.email ?? null;
    this.passwordHash = data.passwordHash ?? data.password_hash ?? null;
    this.firstName = data.firstName ?? data.first_name ?? null;
    this.lastName = data.lastName ?? data.last_name ?? null;
    this.status = data.status ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
    this.deletedAt = toDate(data.deletedAt ?? data.deleted_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = User;
