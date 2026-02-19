/**
 * Puerto: persistencia del perfil crediticio del cliente.
 */
async function findByClientId(clientId) {
  throw new Error('IClientCreditProfileRepository.findByClientId must be implemented');
}
async function create(data) {
  throw new Error('IClientCreditProfileRepository.create must be implemented');
}
async function update(id, data) {
  throw new Error('IClientCreditProfileRepository.update must be implemented');
}
module.exports = { findByClientId, create, update };
