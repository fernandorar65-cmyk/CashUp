/**
 * Puerto: persistencia de préstamos.
 */
async function create(data) {
  throw new Error('ILoanRepository.create must be implemented');
}
async function findById(id) {
  throw new Error('ILoanRepository.findById must be implemented');
}
async function findByClientId(clientId, options = {}) {
  throw new Error('ILoanRepository.findByClientId must be implemented');
}
async function update(id, data) {
  throw new Error('ILoanRepository.update must be implemented');
}
async function getTotalActiveDebtByClientId(clientId) {
  throw new Error('ILoanRepository.getTotalActiveDebtByClientId must be implemented');
}
module.exports = { create, findById, findByClientId, update, getTotalActiveDebtByClientId };
