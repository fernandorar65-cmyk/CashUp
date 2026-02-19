/**
 * Caso de uso: Obtener el perfil del usuario autenticado.
 */
class GetCurrentUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    return user;
  }
}

module.exports = GetCurrentUserUseCase;
