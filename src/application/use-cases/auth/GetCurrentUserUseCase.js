class GetCurrentUserUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

module.exports = GetCurrentUserUseCase;
