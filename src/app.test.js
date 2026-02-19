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

  describe('POST /api/auth/register', () => {
    it('rechaza sin email válido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: '123456',
          firstName: 'A',
          lastName: 'B',
          documentId: '999',
          monthlyIncome: 1000,
        });
      expect(res.status).toBe(400);
    });
  });

  describe('Rutas protegidas', () => {
    it('GET /api/loans sin token devuelve 401', async () => {
      const res = await request(app).get('/api/loans');
      expect(res.status).toBe(401);
    });
  });
});
