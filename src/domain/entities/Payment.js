const { toNumber, toDate } = require('./helpers');

/**
 * Entidad de dominio: Pago (dinero recibido).
 */
class Payment {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.loanId = data.loanId ?? data.loan_id ?? null;
    this.amount = toNumber(data.amount);
    this.paymentMethod = data.paymentMethod ?? data.payment_method ?? null;
    this.reference = data.reference ?? null;
    this.paidAt = toDate(data.paidAt ?? data.paid_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.createdById = data.createdById ?? data.created_by_id ?? null;
  }

  toObject() {
    return { ...this };
  }
}

module.exports = Payment;
