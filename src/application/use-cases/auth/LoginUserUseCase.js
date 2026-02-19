class LoginUserUseCase {
  constructor({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await this.passwordHasher.verify(password, user.passwordHash);
    if (!valid) throw new Error('Credenciales inválidas');

    const token = this.tokenService.generate({ userId: user.id, email: user.email });
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
  }
}

module.exports = LoginUserUseCase;
