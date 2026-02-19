const { toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Risk & Scoring): Historial del puntaje crediticio del cliente.
 */
class CreditScoreHistory {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.score = data.score ?? null;
    this.trigger = data.trigger ?? null;
    this.recordedAt = toDate(data.recordedAt ?? data.recorded_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = CreditScoreHistory;
