const CreditScoringConfig = require('../../value-objects/CreditScoringConfig');
const CreditScoringDomainService = require('../CreditScoringDomainService');

const config = new CreditScoringConfig();
const service = new CreditScoringDomainService(config);

describe('CreditScoringDomainService', () => {
  describe('calculateScore', () => {
    it('debe retornar puntaje entre 0 y 100', () => {
      const score = service.calculateScore({
        monthlyIncome: 2000,
        totalDebt: 500,
        onTimePayments: 10,
        latePayments: 0,
      });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('mejor ingreso aumenta el score', () => {
      const low = service.calculateScore({ monthlyIncome: 500, totalDebt: 0 });
      const high = service.calculateScore({ monthlyIncome: 5000, totalDebt: 0 });
      expect(high).toBeGreaterThan(low);
    });

    it('más deuda reduce el score', () => {
      const lowDebt = service.calculateScore({ monthlyIncome: 3000, totalDebt: 200 });
      const highDebt = service.calculateScore({ monthlyIncome: 3000, totalDebt: 2000 });
      expect(highDebt).toBeLessThan(lowDebt);
    });

    it('pagos a tiempo mejoran el score', () => {
      const noHistory = service.calculateScore({ monthlyIncome: 3000, totalDebt: 0, onTimePayments: 0, latePayments: 0 });
      const goodHistory = service.calculateScore({ monthlyIncome: 3000, totalDebt: 0, onTimePayments: 20, latePayments: 1 });
      expect(goodHistory).toBeGreaterThan(noHistory);
    });
  });

  describe('evaluateApproval', () => {
    it('rechaza si score bajo', () => {
      const result = service.evaluateApproval(40, 3000, 0, 100);
      expect(result.approved).toBe(false);
      expect(result.reason).toMatch(/puntaje|insuficiente/i);
    });

    it('aprueba con score suficiente y capacidad de pago', () => {
      const result = service.evaluateApproval(70, 5000, 0, 50);
      expect(result.approved).toBe(true);
    });
  });

  describe('updateScoreAfterPayment', () => {
    it('pago a tiempo puede subir el score', () => {
      const newScore = service.updateScoreAfterPayment(50, true, 9, 1);
      expect(newScore).toBeGreaterThanOrEqual(50);
    });

    it('pago en mora baja el score', () => {
      const newScore = service.updateScoreAfterPayment(60, false, 5, 5);
      expect(newScore).toBeLessThan(60);
    });
  });
});
