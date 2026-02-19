const { toDate } = require('./helpers');

/**
 * Entidad de dominio: Gestión de cobranza.
 */
class CollectionAction {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.loanId = data.loanId ?? data.loan_id ?? null;
    this.actionType = data.actionType ?? data.action_type ?? null;
    this.outcome = data.outcome ?? null;
    this.note = data.note ?? null;
    this.actionDate = toDate(data.actionDate ?? data.action_date);
    this.createdById = data.createdById ?? data.created_by_id ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = CollectionAction;
