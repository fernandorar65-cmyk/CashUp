class RegisterUserUseCase {
  constructor({ userRepository, creditProfileRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository;
    this.creditProfileRepository = creditProfileRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password, firstName, lastName, documentId, monthlyIncome }) {
    const existing = await this.userRepository.findFirstByEmailOrDocument(email, documentId);
    if (existing) {
      const field = existing.email === email ? 'email' : 'documentId';
      throw new Error(`Ya existe un usuario con este ${field}`);
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      documentId,
      monthlyIncome: Number(monthlyIncome),
    });

    await this.creditProfileRepository.create({
      userId: user.id,
      creditScore: 50,
    });

    const token = this.tokenService.generate({ userId: user.id, email: user.email });
    return { user, token };
  }
}

module.exports = RegisterUserUseCase;
