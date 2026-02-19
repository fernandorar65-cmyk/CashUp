class GetCreditProfileUseCase {
  constructor({ creditProfileRepository }) {
    this.creditProfileRepository = creditProfileRepository;
  }

  async execute(userId) {
    let profile = await this.creditProfileRepository.findByUserId(userId);
    if (!profile) {
      await this.creditProfileRepository.create({ userId, creditScore: 50 });
      profile = await this.creditProfileRepository.findByUserId(userId);
    }
    return profile;
  }
}

module.exports = GetCreditProfileUseCase;
