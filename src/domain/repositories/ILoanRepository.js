class ILoanRepository {
  async findByIdAndUser(loanId, userId) {
    throw new Error('Not implemented');
  }

  async findByUser(userId, status) {
    throw new Error('Not implemented');
  }

  async getTotalActiveDebtByUser(userId) {
    throw new Error('Not implemented');
  }

  async create(data) {
    throw new Error('Not implemented');
  }

  async update(id, data) {
    throw new Error('Not implemented');
  }

  async createAmortizationItems(loanId, items) {
    throw new Error('Not implemented');
  }

  async updateAmortizationItem(id, data) {
    throw new Error('Not implemented');
  }

  async createPayment(data) {
    throw new Error('Not implemented');
  }

  async findLoanWithScheduleAndPayments(loanId, userId) {
    throw new Error('Not implemented');
  }

  async transaction(fn) {
    throw new Error('Not implemented');
  }
}

module.exports = ILoanRepository;
