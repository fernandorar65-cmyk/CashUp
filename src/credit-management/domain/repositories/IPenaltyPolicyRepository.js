/**
 * Puerto: persistencia de políticas de mora.
 */
async function findById(id) {
  throw new Error('IPenaltyPolicyRepository.findById must be implemented');
}
async function getDefault() {
  throw new Error('IPenaltyPolicyRepository.getDefault must be implemented');
}
module.exports = { findById, getDefault };
