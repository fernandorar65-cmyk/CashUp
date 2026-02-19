/**
 * Caso de uso: Evaluar riesgo crediticio para un cliente (pre-aprobación).
 */
class EvaluateCreditUseCase {
  constructor({ clientRepository, creditProfileRepository, creditScoringService, creditEvaluationRepository, loanRepository }) {
    this.clientRepository = clientRepository;
    this.creditProfileRepository = creditProfileRepository;
    this.creditScoringService = creditScoringService;
    this.creditEvaluationRepository = creditEvaluationRepository;
    this.loanRepository = loanRepository;
  }

  async execute(clientId, { amount, termMonths, annualRate }, evaluatedById = null) {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error('Cliente no encontrado');

    const profile = await this.creditProfileRepository.findByClientId(clientId);
    const totalDebt = await this.loanRepository.getTotalActiveDebtByClientId(clientId);

    const score = this.creditScoringService.calculateScore({
      monthlyIncome: client.monthlyIncome,
      totalDebt,
      onTimePayments: profile?.onTimePayments ?? 0,
      latePayments: profile?.latePayments ?? 0,
    });

    const monthlyPayment = (Number(amount) * (Number(annualRate) / 12) * Math.pow(1 + Number(annualRate) / 12, termMonths)) /
      (Math.pow(1 + Number(annualRate) / 12, termMonths) - 1);
    const evaluation = this.creditScoringService.evaluateApproval(
      score,
      Number(client.monthlyIncome),
      totalDebt,
      monthlyPayment
    );

    const evaluationRecord = await this.creditEvaluationRepository.create({
      clientId,
      score,
      result: evaluation.approved ? 'APPROVED' : 'REJECTED',
      factors: evaluation.reason || null,
      evaluatedAt: new Date(),
      evaluatedById,
    });

    return { evaluation: evaluationRecord, approved: evaluation.approved, reason: evaluation.reason, score };
  }
}

module.exports = EvaluateCreditUseCase;
