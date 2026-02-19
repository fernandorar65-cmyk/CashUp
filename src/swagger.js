module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'CashUp API',
    version: '1.0.0',
    description: 'Plataforma de microcréditos inteligente. Credit scoring, préstamos, amortización y pagos.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Desarrollo' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Registro de usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'documentId', 'monthlyIncome'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  documentId: { type: 'string' },
                  monthlyIncome: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Usuario creado y token JWT' }, 400: { description: 'Validación fallida' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Inicio de sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: { email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Token JWT' }, 401: { description: 'Credenciales inválidas' } },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Usuario actual (requiere JWT)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Datos del usuario y perfil crediticio' }, 401: { description: 'No autorizado' } },
      },
    },
    '/api/loans/request': {
      post: {
        summary: 'Solicitar préstamo (evaluación automática)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'termMonths'],
                properties: {
                  amount: { type: 'number', minimum: 100, maximum: 50000 },
                  termMonths: { type: 'integer', minimum: 1, maximum: 36 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Préstamo creado (APPROVED o REJECTED)' }, 400: { description: 'Validación fallida' } },
      },
    },
    '/api/loans': {
      get: {
        summary: 'Listar préstamos del usuario',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID', 'DEFAULTED'] } }],
        responses: { 200: { description: 'Lista de préstamos' } },
      },
    },
    '/api/loans/profile': {
      get: {
        summary: 'Perfil crediticio (score, pagos a tiempo/mora)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'CreditProfile' } },
      },
    },
    '/api/loans/{loanId}': {
      get: {
        summary: 'Detalle de un préstamo',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'loanId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Préstamo con cronograma y pagos' }, 404: { description: 'No encontrado' } },
      },
    },
    '/api/loans/{loanId}/disburse': {
      post: {
        summary: 'Desembolsar préstamo aprobado (genera cronograma)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'loanId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Préstamo activo con cronograma' }, 400: { description: 'No aprobado o ya desembolsado' } },
      },
    },
    '/api/loans/{loanId}/payments': {
      post: {
        summary: 'Registrar pago (actualiza score según puntualidad)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'loanId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: { amount: { type: 'number', minimum: 0.01 }, itemId: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Préstamo actualizado' }, 400: { description: 'Préstamo no activo o sin cuotas pendientes' } },
      },
    },
  },
};
