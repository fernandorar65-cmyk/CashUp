# Hoja de ruta DDD – CashUp

Qué implementar y en qué orden para que la arquitectura siga DDD de forma consistente. Se desarrolla **por Bounded Context** (empezar por IAM, luego el resto).

---

## Estado actual

- ✅ Bounded Contexts definidos y carpetas creadas
- ✅ Entidades de dominio por contexto (solo clases, sin lógica)
- ✅ Shared domain (helpers, enums)
- ✅ Schema Prisma alineado con los BC
- ✅ App mínima (health, errorHandler)
- ❌ Sin capa de aplicación (use cases)
- ❌ Sin puertos (interfaces de repositorios)
- ❌ Sin adaptadores (implementaciones Prisma, auth)
- ❌ Sin composición (container / DI)
- ❌ Sin API por contexto

---

## 1. Por cada Bounded Context: dominio completo

Objetivo: que el **dominio** no dependa de infraestructura ni de frameworks.

### 1.1 Value Objects (donde aplique)

- Objetos inmutables que representan conceptos medibles o descriptivos.
- Ejemplos útiles en CashUp:
  - **Shared:** `Money` (monto + moneda), `DateRange` (desde–hasta).
  - **Credit Management:** `LoanTerms` (monto, plazo, tasa, tipo de interés) para simulación y creación.
  - **Risk & Scoring:** `CreditScore` (valor + nivel de riesgo) si quieres encapsular reglas de “bueno/malo”.

Sitio: `src/<contexto>/domain/value-objects/` o `src/shared/domain/value-objects/` para los compartidos.

### 1.2 Interfaces de repositorio (puertos)

- En el dominio solo van **interfaces** (contratos): qué necesita el dominio para persistir o consultar.
- El dominio **no** conoce Prisma ni SQL.

Ejemplo para IAM:

```js
// src/iam-users/domain/repositories/IUserRepository.js
// Solo métodos que el contexto necesita (findById, findByEmail, create, update, etc.)
```

Sitio: `src/<contexto>/domain/repositories/`.

Cada contexto declara solo los repositorios de **sus** agregados (por ejemplo IAM: `IUserRepository`, `IRoleRepository`; Credit Management: `ILoanRepository`, `IInstallmentRepository`, `IPenaltyPolicyRepository`).

### 1.3 Domain Services (solo lógica pura)

- Cuando la regla de negocio no es responsabilidad de una sola entidad (cálculos, evaluaciones).
- Sin I/O: no llaman a BD ni a APIs externas; reciben datos y devuelven resultados.

Ejemplos:

- **Credit Management:** servicio de amortización (cálculo de cuota, cronograma, interés simple/compuesto).
- **Risk & Scoring:** servicio de scoring (puntaje, aprobado/rechazado según umbrales y ratios).

Sitio: `src/<contexto>/domain/services/`.

### 1.4 Domain Events (opcional pero recomendable)

- Eventos que expresan “algo pasó en el dominio” (ej. `UserRegistered`, `LoanApproved`, `PaymentRecorded`).
- Los use cases los disparan; Audit (y otros BC si quieres) los consumen sin acoplar dominios.

Sitio: `src/<contexto>/domain/events/` o `src/shared/domain/events/` si son genéricos.

---

## 2. Capa de aplicación (use cases)

Objetivo: orquestar el flujo sin poner reglas de negocio aquí; las reglas viven en dominio.

### 2.1 Un use case por acción de usuario

- Un archivo por acción: `RegisterUser`, `LoginUser`, `CreateCredit`, `SimulateCredit`, `RecordPayment`, etc.
- Cada use case:
  1. Recibe entrada (DTO o parámetros simples).
  2. Opcionalmente valida entrada (o delegar validación al borde en la API).
  3. Carga agregados/entidades vía **interfaces** de repositorio.
  4. Llama a entidades o a **domain services** para aplicar reglas.
  5. Persiste vía repositorios.
  6. Opcionalmente dispara **domain events** o llama al contexto Audit.

Sitio: `src/<contexto>/application/use-cases/`.

### 2.2 Dependencias invertidas

- Los use cases reciben en el constructor **solo interfaces** (repositorios, servicios de dominio, etc.).
- No deben hacer `require('@prisma/client')` ni conocer implementaciones concretas.

Ejemplo:

```js
// RegisterUserUseCase recibe: { userRepository, passwordHasher, tokenService }
// userRepository cumple IUserRepository
```

---

## 3. Infraestructura (adaptadores)

Objetivo: implementar los puertos definidos en el dominio y conectar con el mundo exterior.

### 3.1 Repositorios concretos

- Una clase por interfaz: `PrismaUserRepository` implementa `IUserRepository`, etc.
- Aquí sí se usa Prisma: `prisma.user.create(...)`, `prisma.loan.findMany(...)`.
- Mapear resultados de Prisma a **entidades de dominio** (o a value objects) antes de devolverlos.

Sitio: `src/<contexto>/infrastructure/persistence/` o un único `src/infrastructure/persistence/` con subcarpetas por contexto si prefieres compartir Prisma en un solo lugar.

### 3.2 Servicios externos

- Hash de contraseñas (Bcrypt), JWT, envío de emails, llamadas a APIs de scoring externo, etc.
- Implementan interfaces definidas en el dominio (o en application) para no acoplar use cases a librerías concretas.

Sitio: `src/<contexto>/infrastructure/` o `src/infrastructure/auth/`, `src/infrastructure/email/`, etc.

---

## 4. Composición (wiring / DI)

Objetivo: un solo lugar donde se instancian implementaciones y se inyectan en use cases.

- Crear instancias de Prisma, repositorios, domain services, adaptadores (JWT, Bcrypt).
- Instanciar cada use case inyectando sus dependencias (repositorios, servicios).
- Exportar use cases (y quizá repositorios) para que la API los use.

Sitio: `src/container.js` (o por contexto: `src/iam-users/container.js`, etc., y un `src/container.js` que los reúna).

Importante: la capa de **dominio** no debe importar el container ni la infraestructura; la dependencia es siempre hacia dentro (API → application → domain; infrastructure implementa domain/application ports).

---

## 5. API (entrada HTTP)

Objetivo: traducir HTTP a llamadas a use cases y respuestas a JSON.

### 5.1 Rutas por contexto

- Agrupar rutas por BC: `api/routes/auth.js` (IAM), `api/routes/credits.js` (Credit Management), `api/routes/payments.js`, etc.
- Cada ruta: validar cuerpo/query (ej. con express-validator), extraer datos, llamar a **un use case**, mapear resultado a JSON y código HTTP.

### 5.2 Middleware

- Auth (JWT): resolver `userId` (y opcionalmente roles) y dejarlo en `req` para que las rutas lo pasen a los use cases.
- Error handler (ya lo tienes): traducir excepciones de dominio/application a códigos HTTP y mensajes estables.
- Opcional: middleware de permisos por rol (comprobar `req.role` o similar antes de llamar al use case).

Sitio: `src/api/routes/`, `src/api/middleware/`.

---

## 6. Auditoría (contexto Audit)

- Definir en el contexto **Audit** un use case `RecordAuditEvent` (o similar) que reciba: acción, entidad, id, usuario, old/new values, etc.
- En use cases críticos de **otros** contextos (IAM, Credit Management, Payments, etc.), al final del flujo llamar a ese use case (o publicar un evento que Audit consuma).
- Así se mantiene trazabilidad sin mezclar lógica de auditoría con la de cada BC.

---

## Orden sugerido de implementación

Seguir este orden por contexto evita bloqueos y mantiene DDD coherente:

| Fase | Contexto            | Qué implementar |
|------|---------------------|------------------|
| 1    | **IAM / Users**     | Puertos (IUserRepository, IRoleRepository), use cases (Register, Login, GetMe, UpdateMe), adaptadores (Prisma, Bcrypt, JWT), container, rutas `/auth` y `/users/me`. |
| 2    | **Audit**           | Puerto IAuditLogRepository, use case RecordAuditEvent, adaptador Prisma; opcionalmente que IAM lo llame al registrar o al hacer login. |
| 3    | **Risk & Scoring**  | Puertos (IClientRepository, ICreditEvaluationRepository, IClientCreditProfileRepository), domain service de scoring, use cases (GetScoringMe, RecalculateScoring, EvaluateCredit), adaptadores, rutas `/scoring/*`. |
| 4    | **Credit Management**| Puertos (ILoanRepository, IInstallmentRepository, IPenaltyPolicyRepository), domain service de amortización, use cases (SimulateCredit, CreateCredit, GetCredits, Approve, Reject, GetSchedule), adaptadores, rutas `/credits/*`. |
| 5    | **Payments**        | Puertos (IPaymentRepository), use cases (RecordPayment, GetPayments, GetPaymentsByCredit), adaptadores; coordinación con Credit Management para actualizar estado de cuotas. |
| 6    | **Collection**      | Puerto ICollectionActionRepository, use cases (RegisterCollectionAction, GetByClient/Credit), adaptadores, rutas `/collections/*`. |

---

## Resumen de capas (recordatorio)

```
API (routes, middleware)
    → Application (use cases)
        → Domain (entities, value objects, domain services, repository interfaces)
    ← Infrastructure (repository implementations, JWT, Bcrypt, etc.)
```

- **Domain:** sin dependencias de frameworks ni de infraestructura; solo tipos, entidades, value objects, interfaces.
- **Application:** depende solo del dominio (interfaces); orquesta flujos.
- **Infrastructure:** implementa interfaces del dominio/application; conoce Prisma, HTTP, etc.
- **API:** conoce Express (o el framework que uses) y el container; llama use cases y devuelve HTTP.

Con esto la arquitectura se mantiene alineada con DDD y con tu documento de Bounded Contexts.
