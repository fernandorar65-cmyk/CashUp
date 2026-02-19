class GetLoansUseCase {
  constructor({ loanRepository }) {
    this.loanRepository = loanRepository;
  }

  async execute(userId, status) {
    return this.loanRepository.findByUser(userId, status);
  }
}

module.exports = GetLoansUseCase;
