/**
 * Puerto: persistencia de clientes.
 */
async function create(data) {
  throw new Error('IClientRepository.create must be implemented');
}
async function findById(id) {
  throw new Error('IClientRepository.findById must be implemented');
}
async function findByEmail(email) {
  throw new Error('IClientRepository.findByEmail must be implemented');
}
async function findByDocumentId(documentId) {
  throw new Error('IClientRepository.findByDocumentId must be implemented');
}
module.exports = { create, findById, findByEmail, findByDocumentId };
