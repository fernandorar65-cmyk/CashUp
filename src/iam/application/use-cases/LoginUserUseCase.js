/**
 * Caso de uso: Iniciar sesión (login) con email y contraseña.
 */
class LoginUserUseCase {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!valid) throw new Error('Credenciales inválidas');

    const token = this.tokenService.sign({ userId: user.id, email: user.email });
    return { user, token };
  }
}

module.exports = LoginUserUseCase;
