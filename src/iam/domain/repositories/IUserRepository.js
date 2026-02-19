/**
 * Puerto (interfaz): persistencia de usuarios.
 * La capa de aplicación depende de este contrato; la infraestructura lo implementa.
 */

/**
 * @param {object} data - { email, passwordHash, firstName, lastName }
 * @returns {Promise<object>} usuario creado (sin passwordHash en respuesta si se desea)
 */
async function create(data) {
  throw new Error('IUserRepository.create must be implemented');
}

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  throw new Error('IUserRepository.findById must be implemented');
}

/**
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findByEmail(email) {
  throw new Error('IUserRepository.findByEmail must be implemented');
}

/**
 * @param {string} id
 * @param {object} data - campos a actualizar
 * @returns {Promise<object>}
 */
async function update(id, data) {
  throw new Error('IUserRepository.update must be implemented');
}

module.exports = {
  create,
  findById,
  findByEmail,
  update,
};
