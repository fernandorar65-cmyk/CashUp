/**
 * Puerto: persistencia de pagos y aplicaciones.
 */
async function create(data) {
  throw new Error('IPaymentRepository.create must be implemented');
}
async function createApplication(data) {
  throw new Error('IPaymentRepository.createApplication must be implemented');
}
async function findById(id) {
  throw new Error('IPaymentRepository.findById must be implemented');
}
async function findByLoanId(loanId) {
  throw new Error('IPaymentRepository.findByLoanId must be implemented');
}
async function findByClientId(clientId) {
  throw new Error('IPaymentRepository.findByClientId must be implemented');
}
module.exports = { create, createApplication, findById, findByLoanId, findByClientId };
