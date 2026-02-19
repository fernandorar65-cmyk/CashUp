const { toDate } = require('./helpers');

/**
 * Entidad de dominio: Historial de cambios de un préstamo.
 */
class LoanHistory {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.loanId = data.loanId ?? data.loan_id ?? null;
    this.fieldChanged = data.fieldChanged ?? data.field_changed ?? null;
    this.oldValue = data.oldValue ?? data.old_value ?? null;
    this.newValue = data.newValue ?? data.new_value ?? null;
    this.changedAt = toDate(data.changedAt ?? data.changed_at);
    this.changedById = data.changedById ?? data.changed_by_id ?? null;
  }

  toObject() {
    return { ...this };
  }
}

module.exports = LoanHistory;
