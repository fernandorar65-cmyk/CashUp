const { toNumber, toDate } = require('./helpers');

/**
 * Entidad de dominio: Deuda externa del cliente.
 */
class ExternalDebt {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.source = data.source ?? null;
    this.amount = toNumber(data.amount);
    this.currency = data.currency ?? 'PEN';
    this.reportedAt = toDate(data.reportedAt ?? data.reported_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = ExternalDebt;
