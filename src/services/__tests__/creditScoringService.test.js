const {
  calculateCreditScore,
  evaluateLoanApproval,
  updateScoreAfterPayment,
} = require('../creditScoringService');

describe('creditScoringService', () => {
  describe('calculateCreditScore', () => {
    it('debe retornar puntaje entre 0 y 100', () => {
      const score = calculateCreditScore({
        monthlyIncome: 2000,
        totalDebt: 500,
        onTimePayments: 10,
        latePayments: 0,
      });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('mejor ingreso aumenta el score', () => {
      const low = calculateCreditScore({ monthlyIncome: 500, totalDebt: 0 });
      const high = calculateCreditScore({ monthlyIncome: 5000, totalDebt: 0 });
      expect(high).toBeGreaterThan(low);
    });

    it('más deuda reduce el score', () => {
      const lowDebt = calculateCreditScore({ monthlyIncome: 3000, totalDebt: 200 });
      const highDebt = calculateCreditScore({ monthlyIncome: 3000, totalDebt: 2000 });
      expect(highDebt).toBeLessThan(lowDebt);
    });

    it('pagos a tiempo mejoran el score', () => {
      const noHistory = calculateCreditScore({ monthlyIncome: 3000, totalDebt: 0, onTimePayments: 0, latePayments: 0 });
      const goodHistory = calculateCreditScore({ monthlyIncome: 3000, totalDebt: 0, onTimePayments: 20, latePayments: 1 });
      expect(goodHistory).toBeGreaterThan(noHistory);
    });
  });

  describe('evaluateLoanApproval', () => {
    it('rechaza si score bajo', () => {
      const result = evaluateLoanApproval(40, 1000, 3000, 0, 100);
      expect(result.approved).toBe(false);
      expect(result.reason).toMatch(/puntaje|insuficiente/i);
    });

    it('aprueba con score suficiente y capacidad de pago', () => {
      const result = evaluateLoanApproval(70, 1000, 5000, 0, 50);
      expect(result.approved).toBe(true);
    });
  });

  describe('updateScoreAfterPayment', () => {
    it('pago a tiempo puede subir el score', () => {
      const newScore = updateScoreAfterPayment(50, true, 9, 1);
      expect(newScore).toBeGreaterThanOrEqual(50);
    });

    it('pago en mora baja el score', () => {
      const newScore = updateScoreAfterPayment(60, false, 5, 5);
      expect(newScore).toBeLessThan(60);
    });
  });
});
