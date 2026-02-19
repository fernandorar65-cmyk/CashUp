/**
 * Caso de uso: Actualizar perfil del usuario autenticado.
 */
class UpdateCurrentUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const allowed = ['firstName', 'lastName'];
    const toUpdate = {};
    for (const key of allowed) {
      if (data[key] !== undefined) toUpdate[key] = data[key];
    }
    if (Object.keys(toUpdate).length === 0) return user;

    return this.userRepository.update(userId, toUpdate);
  }
}

module.exports = UpdateCurrentUserUseCase;
