const { toNumber, toDate } = require('./helpers');

/**
 * Entidad de dominio: Cuota de un préstamo.
 */
class Installment {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.loanId = data.loanId ?? data.loan_id ?? null;
    this.installmentNumber = data.installmentNumber ?? data.installment_number ?? null;
    this.dueDate = toDate(data.dueDate ?? data.due_date);
    this.principal = toNumber(data.principal);
    this.interest = toNumber(data.interest);
    this.totalDue = toNumber(data.totalDue ?? data.total_due);
    this.paidPrincipal = toNumber(data.paidPrincipal ?? data.paid_principal) ?? 0;
    this.paidInterest = toNumber(data.paidInterest ?? data.paid_interest) ?? 0;
    this.paidLateFee = toNumber(data.paidLateFee ?? data.paid_late_fee) ?? 0;
    this.status = data.status ?? null;
    this.paidAt = toDate(data.paidAt ?? data.paid_at);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = Installment;
