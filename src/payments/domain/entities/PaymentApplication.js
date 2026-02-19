const { toNumber, toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Payments): Aplicación de un pago a una cuota (distribución).
 */
class PaymentApplication {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.paymentId = data.paymentId ?? data.payment_id ?? null;
    this.installmentId = data.installmentId ?? data.installment_id ?? null;
    this.amountApplied = toNumber(data.amountApplied ?? data.amount_applied);
    this.appliedToPrincipal = toNumber(data.appliedToPrincipal ?? data.applied_to_principal) ?? 0;
    this.appliedToInterest = toNumber(data.appliedToInterest ?? data.applied_to_interest) ?? 0;
    this.appliedToLateFee = toNumber(data.appliedToLateFee ?? data.applied_to_late_fee) ?? 0;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = PaymentApplication;
