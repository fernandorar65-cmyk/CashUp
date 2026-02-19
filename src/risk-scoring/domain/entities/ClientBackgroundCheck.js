const { toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Risk & Scoring): Verificación externa del cliente (judicial, listas de riesgo).
 */
class ClientBackgroundCheck {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.checkType = data.checkType ?? data.check_type ?? null;
    this.result = data.result ?? null;
    this.referenceId = data.referenceId ?? data.reference_id ?? null;
    this.checkedAt = toDate(data.checkedAt ?? data.checked_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = ClientBackgroundCheck;
