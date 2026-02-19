const CreditScoringConfig = require('../../value-objects/CreditScoringConfig');
const AmortizationDomainService = require('../AmortizationDomainService');

const config = new CreditScoringConfig();
const service = new AmortizationDomainService(config);

describe('AmortizationDomainService', () => {
  describe('calculateMonthlyPayment', () => {
    it('calcula cuota mensual para préstamo sin interés', () => {
      const pmt = service.calculateMonthlyPayment(12000, 0, 12);
      expect(pmt).toBe(1000);
    });

    it('calcula cuota con tasa positiva', () => {
      const pmt = service.calculateMonthlyPayment(10000, 0.12, 12);
      expect(pmt).toBeGreaterThan(833);
      expect(pmt).toBeLessThan(1000);
    });
  });

  describe('generateSchedule', () => {
    it('genera N cuotas para N meses', () => {
      const schedule = service.generateSchedule(10000, 0.24, 12, new Date('2025-01-01'));
      expect(schedule).toHaveLength(12);
      expect(schedule[0].installmentNumber).toBe(1);
      expect(schedule[11].installmentNumber).toBe(12);
    });

    it('suma de principal igual al monto del préstamo', () => {
      const schedule = service.generateSchedule(5000, 0.12, 6, new Date('2025-01-01'));
      const totalPrincipal = schedule.reduce((s, i) => s + Number(i.principal), 0);
      expect(totalPrincipal).toBeCloseTo(5000, 2);
    });
  });

  describe('calculateTotalToPay', () => {
    it('total sin interés = principal', () => {
      const total = service.calculateTotalToPay(6000, 0, 6);
      expect(total).toBe(6000);
    });

    it('total con interés > principal', () => {
      const total = service.calculateTotalToPay(10000, 0.24, 12);
      expect(total).toBeGreaterThan(10000);
    });
  });

  describe('calculateLatePenalty', () => {
    it('devuelve número positivo para monto y días positivos', () => {
      const penalty = service.calculateLatePenalty(100, 30);
      expect(penalty).toBeGreaterThanOrEqual(0);
    });
  });
});
