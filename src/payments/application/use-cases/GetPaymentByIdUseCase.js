/**
 * Caso de uso: Obtener detalle de un pago.
 */
class GetPaymentByIdUseCase {
  constructor({ paymentRepository }) {
    this.paymentRepository = paymentRepository;
  }

  async execute(paymentId) {
    return this.paymentRepository.findById(paymentId);
  }
}

module.exports = GetPaymentByIdUseCase;
