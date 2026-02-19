/**
 * Puerto: persistencia de cuotas (installments).
 */
async function createMany(loanId, items) {
  throw new Error('IInstallmentRepository.createMany must be implemented');
}
async function findByLoanId(loanId) {
  throw new Error('IInstallmentRepository.findByLoanId must be implemented');
}
async function update(id, data) {
  throw new Error('IInstallmentRepository.update must be implemented');
}
module.exports = { createMany, findByLoanId, update };
