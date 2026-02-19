/**
 * Caso de uso: Registrar un usuario (staff) en el sistema.
 */
class RegisterUserUseCase {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password, firstName, lastName }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error('El correo ya está registrado');

    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    const token = this.tokenService.sign({ userId: user.id, email: user.email });
    return { user, token };
  }
}

module.exports = RegisterUserUseCase;
