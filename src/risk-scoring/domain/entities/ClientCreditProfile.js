const { toNumber, toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Risk & Scoring): Perfil crediticio actual del cliente (score, indicadores).
 */
class ClientCreditProfile {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.creditScore = data.creditScore ?? data.credit_score ?? null;
    this.riskLevel = data.riskLevel ?? data.risk_level ?? null;
    this.totalDebt = toNumber(data.totalDebt ?? data.total_debt) ?? 0;
    this.onTimePayments = data.onTimePayments ?? data.on_time_payments ?? 0;
    this.latePayments = data.latePayments ?? data.late_payments ?? 0;
    this.lastCalculatedAt = toDate(data.lastCalculatedAt ?? data.last_calculated_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = ClientCreditProfile;
