const { toNumber, toDate } = require('./helpers');

/**
 * Entidad de dominio: Penalidad por mora en una cuota.
 */
class LateFee {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.installmentId = data.installmentId ?? data.installment_id ?? null;
    this.amount = toNumber(data.amount);
    this.periodFrom = toDate(data.periodFrom ?? data.period_from);
    this.periodTo = toDate(data.periodTo ?? data.period_to);
    this.policyId = data.policyId ?? data.policy_id ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = LateFee;
