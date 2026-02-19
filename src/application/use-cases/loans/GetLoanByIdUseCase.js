class GetLoanByIdUseCase {
  constructor({ loanRepository }) {
    this.loanRepository = loanRepository;
  }

  async execute(loanId, userId) {
    return this.loanRepository.findLoanWithScheduleAndPayments(loanId, userId);
  }
}

module.exports = GetLoanByIdUseCase;
