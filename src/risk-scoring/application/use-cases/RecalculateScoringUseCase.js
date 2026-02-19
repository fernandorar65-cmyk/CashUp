/**
 * Caso de uso: Recalcular puntaje de un cliente (y actualizar perfil).
 */
class RecalculateScoringUseCase {
  constructor({ clientRepository, creditProfileRepository, creditScoringService, loanRepository }) {
    this.clientRepository = clientRepository;
    this.creditProfileRepository = creditProfileRepository;
    this.creditScoringService = creditScoringService;
    this.loanRepository = loanRepository;
  }

  async execute(clientId) {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error('Cliente no encontrado');

    const profile = await this.creditProfileRepository.findByClientId(clientId);
    const totalDebt = await this.loanRepository.getTotalActiveDebtByClientId(clientId);

    const score = this.creditScoringService.calculateScore({
      monthlyIncome: client.monthlyIncome,
      totalDebt,
      onTimePayments: profile?.onTimePayments ?? 0,
      latePayments: profile?.latePayments ?? 0,
    });

    const profileData = {
      clientId,
      creditScore: score,
      totalDebt,
      onTimePayments: profile?.onTimePayments ?? 0,
      latePayments: profile?.latePayments ?? 0,
      lastCalculatedAt: new Date(),
    };

    if (profile) {
      await this.creditProfileRepository.update(profile.id, profileData);
      return { ...profile, ...profileData };
    }
    return this.creditProfileRepository.create(profileData);
  }
}

module.exports = RecalculateScoringUseCase;
