# CashUp

Plataforma de microcréditos inteligente en Node.js que gestiona el ciclo completo del préstamo: solicitud, evaluación de riesgo (credit scoring), aprobación/rechazo automático, cronograma de amortización, penalidades por mora y actualización del puntaje crediticio.

## Arquitectura DDD

El proyecto sigue **Domain-Driven Design** con capas bien definidas:

```
src/
├── domain/                    # Capa de dominio
│   ├── entities/              # Modelos por tabla (Client, Loan, Installment, Payment, etc.)
│   ├── value-objects/         # CreditScoringConfig
│   ├── services/              # CreditScoringDomainService, AmortizationDomainService
│   └── repositories/          # Interfaces (IUserRepository, ILoanRepository, etc.)
├── application/               # Capa de aplicación (use cases)
│   └── use-cases/
│       ├── auth/              # RegisterUser, LoginUser, GetCurrentUser
│       └── loans/             # RequestLoan, DisburseLoan, RecordPayment, GetLoans, etc.
├── infrastructure/            # Capa de infraestructura
│   ├── persistence/           # PrismaUserRepository, PrismaLoanRepository, etc.
│   └── auth/                  # JwtTokenService, BcryptPasswordHasher
├── presentation/              # Rutas Express (routes/, middleware/)
├── container.js               # Composition Root (inyección de dependencias)
└── config/
```

- **Domain**: Lógica de negocio pura (scoring, amortización). Sin dependencias externas.
- **Application**: Orquestación de use cases que coordinan dominio + repositorios.
- **Infrastructure**: Implementaciones concretas (Prisma, JWT, Bcrypt).
- **Presentation**: HTTP, validación, control de errores.

## Stack

- **Node.js** + **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **JWT** (autenticación)
- **Bcrypt** (contraseñas)
- **Jest** (tests)
- **Swagger** (documentación API)
- **Docker** (contenedores)

*(Azure Functions se pueden añadir como capa serverless para tareas programadas o webhooks; la API principal corre en Express.)*

## Requisitos

- Node.js >= 18
- PostgreSQL 14+ (o usar Docker)

## Instalación

```bash
cd CashUp
npm install
cp .env.example .env
# Editar .env con DATABASE_URL y JWT_SECRET
```

## Base de datos

```bash
# Crear tablas
npm run db:push

# Opcional: migraciones versionadas
npm run db:migrate

# Generar cliente Prisma
npm run db:generate

# Datos de prueba
npm run db:seed
```

## Desarrollo

```bash
# Con PostgreSQL en Docker
docker-compose -f docker-compose.dev.yml up -d
# En .env: DATABASE_URL="postgresql://cashup:cashup@localhost:5432/cashup_db"

npm run dev
```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/api-docs  

## Tests

```bash
npm test
npm run test:watch
```

## Docker (producción)

```bash
docker-compose up -d
# App en :3000, PostgreSQL en :5432
```

## Flujo principal

1. **Registro / Login** → `POST /api/auth/register`, `POST /api/auth/login`
2. **Solicitar préstamo** → `POST /api/loans/request` (body: `amount`, `termMonths`)
   - El sistema calcula el credit score (ingresos, deuda, historial de pagos).
   - Evalúa aprobación/rechazo y crea el préstamo en estado APPROVED o REJECTED.
3. **Desembolso** → `POST /api/loans/:loanId/disburse` (solo si está APPROVED)
   - Genera el cronograma de amortización (método francés).
4. **Pagos** → `POST /api/loans/:loanId/payments` (body: `amount`, opcional `itemId`)
   - Se aplica a la siguiente cuota pendiente; si hay mora, se calcula penalidad.
   - Se actualiza el puntaje crediticio según si el pago fue a tiempo o en mora.
5. **Consultas** → `GET /api/loans`, `GET /api/loans/profile`, `GET /api/loans/:loanId`

## Variables de entorno (.env)

| Variable | Descripción |
|---------|-------------|
| `PORT` | Puerto del servidor (default 3000) |
| `DATABASE_URL` | URL de conexión PostgreSQL |
| `JWT_SECRET` | Clave para firmar JWT |
| `JWT_EXPIRES_IN` | Expiración del token (ej. 7d) |
| `MIN_CREDIT_SCORE_APPROVAL` | Puntaje mínimo para aprobar (default 60) |
| `MAX_DEBT_TO_INCOME_RATIO` | Ratio máximo deuda/ingreso (default 0.4) |
| `DEFAULT_INTEREST_RATE` | Tasa de interés por defecto (default 0.02) |
| `LATE_PENALTY_RATE` | Tasa de penalidad por mora (default 0.01) |

## Licencia

MIT
