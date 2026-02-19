/**
 * Caso de uso: Registrar un pago y aplicarlo a una o varias cuotas.
 */
class RecordPaymentUseCase {
  constructor({ paymentRepository, installmentRepository, loanRepository }) {
    this.paymentRepository = paymentRepository;
    this.installmentRepository = installmentRepository;
    this.loanRepository = loanRepository;
  }

  async execute(clientId, loanId, { amount, paymentMethod, reference }, createdById = null) {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) throw new Error('Préstamo no encontrado');
    if (loan.clientId !== clientId) throw new Error('Préstamo no pertenece al cliente');
    if (loan.status !== 'ACTIVE') throw new Error('Solo se pueden registrar pagos en préstamos activos');

    const installments = await this.installmentRepository.findByLoanId(loanId);
    const pending = installments.filter((i) => i.status !== 'PAID' && Number(i.totalDue) > Number(i.paidPrincipal) + Number(i.paidInterest) + Number(i.paidLateFee));
    if (pending.length === 0) throw new Error('No hay cuotas pendientes');

    const paidAt = new Date();
    const payment = await this.paymentRepository.create({
      clientId,
      loanId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CASH',
      reference: reference || null,
      paidAt,
      createdById,
    });

    let remaining = Number(amount);
    for (const inst of pending) {
      if (remaining <= 0) break;
      const totalDue = Number(inst.totalDue) - Number(inst.paidPrincipal) - Number(inst.paidInterest) - Number(inst.paidLateFee);
      const toApply = Math.min(remaining, totalDue);
      if (toApply <= 0) continue;

      const toPrincipal = Math.min(toApply, Number(inst.principal) - Number(inst.paidPrincipal));
      const toInterest = Math.min(toApply - toPrincipal, Number(inst.interest) - Number(inst.paidInterest));
      const toLateFee = toApply - toPrincipal - toInterest;

      await this.paymentRepository.createApplication({
        paymentId: payment.id,
        installmentId: inst.id,
        amountApplied: toApply,
        appliedToPrincipal: toPrincipal,
        appliedToInterest: toInterest,
        appliedToLateFee: toLateFee,
      });

      const newPaidPrincipal = Number(inst.paidPrincipal) + toPrincipal;
      const newPaidInterest = Number(inst.paidInterest) + toInterest;
      const newPaidLateFee = Number(inst.paidLateFee) + toLateFee;
      const newTotalPaid = newPaidPrincipal + newPaidInterest + newPaidLateFee;
      const instStatus = newTotalPaid >= Number(inst.totalDue) ? 'PAID' : 'PARTIAL';

      await this.installmentRepository.update(inst.id, {
        paidPrincipal: newPaidPrincipal,
        paidInterest: newPaidInterest,
        paidLateFee: newPaidLateFee,
        status: instStatus,
        ...(instStatus === 'PAID' ? { paidAt } : {}),
      });

      remaining -= toApply;
    }

    return this.paymentRepository.findById(payment.id);
  }
}

module.exports = RecordPaymentUseCase;
