const { toDate } = require('./helpers');

/**
 * Entidad de dominio: Refinanciamiento (préstamo original → nuevo).
 */
class LoanRefinance {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.originalLoanId = data.originalLoanId ?? data.original_loan_id ?? null;
    this.newLoanId = data.newLoanId ?? data.new_loan_id ?? null;
    this.reason = data.reason ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.createdById = data.createdById ?? data.created_by_id ?? null;
  }

  toObject() {
    return { ...this };
  }
}

module.exports = LoanRefinance;
