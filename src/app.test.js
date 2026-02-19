const request = require('supertest');
const app = require('./app');

describe('CashUp API', () => {
  describe('GET /health', () => {
    it('responde con status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('CashUp');
    });
  });
});
