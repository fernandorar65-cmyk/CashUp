/**
 * Puerto: persistencia de evaluaciones crediticias.
 */
async function create(data) {
  throw new Error('ICreditEvaluationRepository.create must be implemented');
}
async function findById(id) {
  throw new Error('ICreditEvaluationRepository.findById must be implemented');
}
module.exports = { create, findById };
