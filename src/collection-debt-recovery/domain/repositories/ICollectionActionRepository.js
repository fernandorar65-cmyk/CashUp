/**
 * Puerto: persistencia de gestiones de cobranza.
 */
async function create(data) {
  throw new Error('ICollectionActionRepository.create must be implemented');
}
async function findByClientId(clientId) {
  throw new Error('ICollectionActionRepository.findByClientId must be implemented');
}
async function findByLoanId(loanId) {
  throw new Error('ICollectionActionRepository.findByLoanId must be implemented');
}
module.exports = { create, findByClientId, findByLoanId };
