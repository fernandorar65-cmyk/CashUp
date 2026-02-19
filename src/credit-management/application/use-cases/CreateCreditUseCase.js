/**
 * Caso de uso: Crear un préstamo (pendiente de aprobación/desembolso).
 */
class CreateCreditUseCase {
  constructor({
    loanRepository,
    creditEvaluationRepository,
    amortizationService,
    penaltyPolicyRepository,
    defaultInterestRate,
  }) {
    this.loanRepository = loanRepository;
    this.creditEvaluationRepository = creditEvaluationRepository;
    this.amortizationService = amortizationService;
    this.penaltyPolicyRepository = penaltyPolicyRepository;
    this.defaultInterestRate = defaultInterestRate;
  }

  async execute(clientId, { amount, termMonths, annualRate, creditEvaluationId }, approvedById = null) {
    const rate = Number(annualRate ?? this.defaultInterestRate);
    const principal = Number(amount);
    const term = Number(termMonths);

    const monthlyPayment = this.amortizationService.calculateMonthlyPayment(principal, rate, term);
    const totalToPay = this.amortizationService.calculateTotalToPay(principal, rate, term);

    let status = 'PENDING';
    let rejectionReason = null;
    let approvedAt = null;

    if (creditEvaluationId) {
      const evaluation = await this.creditEvaluationRepository.findById(creditEvaluationId);
      if (evaluation) {
        status = evaluation.result === 'APPROVED' ? 'APPROVED' : 'REJECTED';
        rejectionReason = evaluation.result === 'REJECTED' ? evaluation.factors : null;
        approvedAt = evaluation.result === 'APPROVED' ? new Date() : null;
      }
    }

    const defaultPolicy = await this.penaltyPolicyRepository.getDefault();
    const loan = await this.loanRepository.create({
      clientId,
      amount: principal,
      termMonths: term,
      interestRate: rate,
      interestType: 'SIMPLE',
      monthlyPayment,
      totalToPay,
      status,
      penaltyPolicyId: defaultPolicy?.id ?? null,
      creditEvaluationId: creditEvaluationId ?? null,
      rejectionReason,
      approvedAt,
      approvedById: status === 'APPROVED' ? approvedById : null,
    });

    return loan;
  }
}

module.exports = CreateCreditUseCase;
