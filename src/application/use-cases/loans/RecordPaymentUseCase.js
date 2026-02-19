class RecordPaymentUseCase {
  constructor({ loanRepository, creditProfileRepository, creditScoringService, amortizationService }) {
    this.loanRepository = loanRepository;
    this.creditProfileRepository = creditProfileRepository;
    this.creditScoringService = creditScoringService;
    this.amortizationService = amortizationService;
  }

  async execute(userId, loanId, amount, itemId) {
    const loan = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (loan.status !== 'ACTIVE') throw new Error('Solo se pueden registrar pagos en préstamos activos');

    const item = itemId
      ? loan.schedule.find((s) => s.id === itemId)
      : loan.schedule.find((s) => Number(s.paidAmount) < Number(s.totalDue));

    if (!item) throw new Error('No hay cuotas pendientes o el ítem no existe');

    const isLate = new Date() > new Date(item.dueDate);
    const daysLate = isLate ? Math.ceil((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
    const paid = Number(amount);

    let penalty = Number(item.latePenalty);
    if (isLate && penalty === 0) {
      const due = Number(item.totalDue) - Number(item.paidAmount);
      penalty = this.amortizationService.calculateLatePenalty(due, daysLate);
      await this.loanRepository.updateAmortizationItem(item.id, {
        latePenalty: penalty,
        isOverdue: true,
      });
    }

    let remaining = paid;
    const appliedToPenalty = Math.min(remaining, penalty);
    remaining -= appliedToPenalty;
    const appliedToInterest = Math.min(remaining, Number(item.interest));
    remaining -= appliedToInterest;
    const appliedToPrincipal = Math.min(remaining, Number(item.principal));

    await this.loanRepository.createPayment({
      loanId,
      itemId: item.id,
      amount: paid,
      appliedToPrincipal,
      appliedToInterest,
      appliedToPenalty,
      isLate,
    });

    const newPaidAmount = Number(item.paidAmount) + paid;
    await this.loanRepository.updateAmortizationItem(item.id, {
      paidAmount: newPaidAmount,
      paidAt: new Date(),
    });

    const profile = loan.user.creditProfile;
    const newOnTime = profile.onTimePayments + (isLate ? 0 : 1);
    const newLate = profile.latePayments + (isLate ? 1 : 0);
    const newScore = this.creditScoringService.updateScoreAfterPayment(
      profile.creditScore,
      !isLate,
      newOnTime,
      newLate
    );

    const totalDebt = await this.loanRepository.getTotalActiveDebtByUser(userId);
    await this.creditProfileRepository.update(profile.id, {
      creditScore: newScore,
      onTimePayments: newOnTime,
      latePayments: newLate,
      totalDebt,
      lastScoreUpdate: new Date(),
    });

    const allPaid = loan.schedule.every((s) => {
      const total = Number(s.totalDue) + Number(s.latePenalty);
      return Number(s.paidAmount) >= total || (s.id === item.id && newPaidAmount >= total);
    });
    if (allPaid) {
      await this.loanRepository.update(loanId, { status: 'PAID' });
    }

    return this.loanRepository.findLoanWithScheduleAndPayments(loanId, userId);
  }
}

module.exports = RecordPaymentUseCase;
