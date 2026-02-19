const { toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (IAM): Rol (perfil de permisos).
 */
class Role {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.name = data.name ?? null;
    this.description = data.description ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = Role;
