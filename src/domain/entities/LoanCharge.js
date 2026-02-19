const { toNumber, toDate } = require('./helpers');

/**
 * Entidad de dominio: Cargo adicional del préstamo (comisión, seguro, etc.).
 */
class LoanCharge {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.loanId = data.loanId ?? data.loan_id ?? null;
    this.chargeType = data.chargeType ?? data.charge_type ?? null;
    this.description = data.description ?? null;
    this.amount = toNumber(data.amount);
    this.appliedAt = toDate(data.appliedAt ?? data.applied_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = LoanCharge;
