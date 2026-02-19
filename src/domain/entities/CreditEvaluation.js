const { toDate } = require('./helpers');

/**
 * Entidad de dominio: Evaluación de riesgo crediticio (pre-aprobación).
 */
class CreditEvaluation {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.score = data.score ?? null;
    this.result = data.result ?? null;
    this.factors = data.factors ?? null;
    this.evaluatedAt = toDate(data.evaluatedAt ?? data.evaluated_at);
    this.evaluatedById = data.evaluatedById ?? data.evaluated_by_id ?? null;
  }

  toObject() {
    return { ...this };
  }
}

module.exports = CreditEvaluation;
