const { toNumber, toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Credit Management): Política de mora (reglas de cálculo).
 */
class PenaltyPolicy {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.name = data.name ?? null;
    this.rate = toNumber(data.rate);
    this.graceDays = data.graceDays ?? data.grace_days ?? null;
    this.calculationType = data.calculationType ?? data.calculation_type ?? null;
    this.isDefault = data.isDefault ?? data.is_default ?? false;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = PenaltyPolicy;
