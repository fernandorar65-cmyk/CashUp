class RequestLoanUseCase {
  constructor({ userRepository, creditProfileRepository, loanRepository, creditScoringService, amortizationService, config }) {
    this.userRepository = userRepository;
    this.creditProfileRepository = creditProfileRepository;
    this.loanRepository = loanRepository;
    this.creditScoringService = creditScoringService;
    this.amortizationService = amortizationService;
    this.config = config;
  }

  async execute(userId, { amount, termMonths }) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    let profile = await this.creditProfileRepository.findByUserId(userId);
    if (!profile) {
      await this.creditProfileRepository.create({ userId, creditScore: 50 });
      profile = await this.creditProfileRepository.findByUserId(userId);
    }

    const totalDebt = await this.loanRepository.getTotalActiveDebtByUser(userId);
    const score = this.creditScoringService.calculateScore({
      monthlyIncome: Number(user.monthlyIncome),
      totalDebt: Number(totalDebt),
      onTimePayments: profile.onTimePayments,
      latePayments: profile.latePayments,
    });

    const rate = this.config.defaultInterestRate;
    const monthlyPayment = this.amortizationService.calculateMonthlyPayment(amount, rate, termMonths);
    const totalToPay = this.amortizationService.calculateTotalToPay(amount, rate, termMonths);

    const evaluation = this.creditScoringService.evaluateApproval(
      score,
      Number(user.monthlyIncome),
      totalDebt,
      monthlyPayment
    );

    const loan = await this.loanRepository.create({
      userId,
      amount: Number(amount),
      termMonths,
      interestRate: rate,
      monthlyPayment,
      totalToPay,
      status: evaluation.approved ? 'APPROVED' : 'REJECTED',
      creditScoreAt: score,
      rejectionReason: evaluation.approved ? null : evaluation.reason,
      approvedAt: evaluation.approved ? new Date() : null,
    });

    return { loan, evaluation };
  }
}

module.exports = RequestLoanUseCase;
