/**
 * Caso de uso: Listar pagos de un préstamo.
 */
class GetPaymentsByCreditUseCase {
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
  }

  async execute(loanId) {
    return this.paymentRepository.findByLoanId(loanId);
  }
}

module.exports = GetPaymentsByCreditUseCase;
