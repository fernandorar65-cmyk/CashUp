const { toNumber, toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Credit Management): Préstamo / Crédito.
 */
class Loan {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.clientId = data.clientId ?? data.client_id ?? null;
    this.amount = toNumber(data.amount);
    this.termMonths = data.termMonths ?? data.term_months ?? null;
    this.interestRate = toNumber(data.interestRate ?? data.interest_rate);
    this.interestType = data.interestType ?? data.interest_type ?? 'SIMPLE';
    this.monthlyPayment = toNumber(data.monthlyPayment ?? data.monthly_payment);
    this.totalToPay = toNumber(data.totalToPay ?? data.total_to_pay);
    this.status = data.status ?? null;
    this.penaltyPolicyId = data.penaltyPolicyId ?? data.penalty_policy_id ?? null;
    this.creditEvaluationId = data.creditEvaluationId ?? data.credit_evaluation_id ?? null;
    this.rejectionReason = data.rejectionReason ?? data.rejection_reason ?? null;
    this.approvedAt = toDate(data.approvedAt ?? data.approved_at);
    this.approvedById = data.approvedById ?? data.approved_by_id ?? null;
    this.disbursedAt = toDate(data.disbursedAt ?? data.disbursed_at);
    this.dueDate = toDate(data.dueDate ?? data.due_date);
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = Loan;
