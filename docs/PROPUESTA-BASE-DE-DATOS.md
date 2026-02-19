# Propuesta de base de datos – CashUp (contextos IAM, Credits, Payments, Scoring)

Documento de diseño según los servicios definidos en `Contexts.md`. **Solo propuesta; no implementado.**

---

## 1. Resumen por contexto

| Contexto | Tablas principales | Objetivo |
|----------|--------------------|----------|
| **IAM** | `users`, (opcional) `roles` | Registro, login, perfil, baja de cuenta |
| **Credit Management** | `credits`, `credit_schedule` | Solicitudes, estados, cronograma, aprobación/rechazo admin |
| **Payments** | `payments` | Pagos por usuario y por crédito, aplicación a cuotas |
| **Risk & Scoring** | `credit_profiles`, (opcional) `scoring_history` | Score, indicadores de riesgo, recálculo |

---

## 2. IAM Context

### 2.1 `users`

Usuarios del sistema (registro, login, GET/PUT/DELETE `/users/me`).
| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID/cuid | PK |
| `email` | string | Unique, not null |
| `password_hash` | string | Not null |
| `first_name` | string | |
| `last_name` | string | |
| `document_id` | string | Unique (DNI/identificación) |
| `monthly_income` | decimal(12,2) | Para scoring y capacidad de pago |
| `role` | enum | `USER` \| `ADMIN` (para PATCH approve/reject créditos) |
| `status` | enum | `ACTIVE` \| `DELETED` (soft delete en DELETE /users/me) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |
| `deleted_at` | timestamp nullable | Si se usa soft delete |

- **GET/PUT /users/me**: lectura/actualización de este registro.
- **DELETE /users/me**: marcar `status = DELETED` y `deleted_at = now()`.

### 2.2 (Opcional) `roles` y `user_roles`

Si en el futuro hay más de dos roles o permisos granulares:

- **roles**: `id`, `name` (ej. `USER`, `ADMIN`).
- **user_roles**: `user_id`, `role_id`, PK compuesta.
- En la propuesta mínima basta con un campo `role` en `users`.

---

## 3. Credit Management Context

En la propuesta se mantiene la idea de “crédito” igual que el “loan” actual; se puede renombrar a `credits` para alinear con la API.

### 3.1 `credits` (equivalente a `loans`)

Solicitudes y préstamos (POST /credits, GET /credits, GET /credits/:id, GET /credits/active, GET /credits/history, PATCH approve/reject).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID/cuid | PK |
| `user_id` | UUID | FK → users, not null |
| `amount` | decimal(12,2) | Monto solicitado |
| `term_months` | int | Plazo en meses |
| `interest_rate` | decimal(5,4) | Tasa anual (ej. 0.02 = 2%) |
| `monthly_payment` | decimal(12,2) | Cuota mensual calculada |
| `total_to_pay` | decimal(12,2) | Total principal + intereses |
| `status` | enum | Ver abajo |
| `credit_score_at_request` | int nullable | Score en el momento de la solicitud |
| `rejection_reason` | string nullable | Si status = REJECTED |
| `requested_at` | timestamp | = created_at o campo explícito |
| `approved_at` | timestamp nullable | Fecha de aprobación (auto o admin) |
| `rejected_at` | timestamp nullable | Fecha de rechazo |
| `approved_by` | UUID nullable | FK → users, si aprobación manual (admin) |
| `disbursed_at` | timestamp nullable | Cuando se desembolsa (pasa a ACTIVE) |
| `due_date` | date nullable | Fecha última cuota |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Status sugerido:**  
`PENDING` | `APPROVED` | `REJECTED` | `ACTIVE` | `PAID` | `DEFAULTED`

- **GET /credits**: `WHERE user_id = :userId` (y opcional filtro por status).
- **GET /credits/active**: `status IN ('PENDING','APPROVED','ACTIVE')` o solo `ACTIVE`, según definición de “activo”.
- **GET /credits/history**: `status IN ('REJECTED','PAID','DEFAULTED')`.
- **PATCH approve/reject**: solo si `role = ADMIN` y `status = PENDING`; actualizar `status`, `approved_at`/`rejected_at`, `rejection_reason`, `approved_by`.

### 3.2 `credit_schedule` (equivalente a `amortization_items`)

Tabla de amortización (GET /credits/:creditId/schedule).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID/cuid | PK |
| `credit_id` | UUID | FK → credits, not null |
| `installment_number` | int | Número de cuota (1..N) |
| `due_date` | date | Fecha vencimiento |
| `principal` | decimal(12,2) | Amortización capital |
| `interest` | decimal(12,2) | Interés de la cuota |
| `late_penalty` | decimal(12,2) | Default 0 |
| `total_due` | decimal(12,2) | principal + interest + late_penalty |
| `paid_amount` | decimal(12,2) | Default 0 |
| `paid_at` | timestamp nullable | |
| `is_overdue` | boolean | Default false |
| `created_at` / `updated_at` | timestamp | |

- **POST /credits** (si se aprueba): crear filas en `credit_schedule` para cada cuota.
- **GET /credits/:creditId/schedule**: `WHERE credit_id = :creditId ORDER BY installment_number`.

---

## 4. Payments Context

### 4.1 `payments`

Registro y consulta de pagos (POST /payments, GET /payments, GET /payments/:id, GET /credits/:creditId/payments).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID/cuid | PK |
| `user_id` | UUID | FK → users, not null (facilita GET /payments por usuario) |
| `credit_id` | UUID | FK → credits, not null |
| `schedule_item_id` | UUID nullable | FK → credit_schedule (cuota a la que se aplica) |
| `amount` | decimal(12,2) | Monto del pago |
| `applied_to_principal` | decimal(12,2) | Porción a capital |
| `applied_to_interest` | decimal(12,2) | Porción a interés |
| `applied_to_penalty` | decimal(12,2) | Porción a mora |
| `is_late` | boolean | Si se pagó después del due_date de la cuota |
| `paid_at` | timestamp | Fecha/hora del pago |
| `created_at` | timestamp | |

- **POST /payments**: insertar aquí y actualizar `credit_schedule.paid_amount`, `paid_at` (y lógica de scoring).
- **GET /payments**: `WHERE user_id = :userId`.
- **GET /payments/:paymentId**: por `id`.
- **GET /credits/:creditId/payments**: `WHERE credit_id = :creditId`.

Incluir `user_id` en `payments` evita tener que hacer JOIN con `credits` solo para listar “todos los pagos del usuario”.

---

## 5. Risk & Scoring Context

### 5.1 `credit_profiles`

Score e indicadores (GET /scoring/me, insumos para POST /scoring/recalculate).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID/cuid | PK |
| `user_id` | UUID | FK → users, unique, not null |
| `credit_score` | int | 0–100 |
| `risk_level` | enum nullable | Ej. `LOW` \| `MEDIUM` \| `HIGH` (derivado del score o reglas) |
| `total_debt` | decimal(12,2) | Deuda actual (créditos activos) |
| `on_time_payments` | int | Contador pagos a tiempo |
| `late_payments` | int | Contador pagos en mora |
| `last_calculated_at` | timestamp nullable | Última vez que se recalculó el score |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

- **GET /scoring/me**: devolver `credit_score`, `risk_level`, total_debt, on_time_payments, late_payments, last_calculated_at (y lo que se considere “indicadores”).
- **POST /scoring/recalculate**: recalcular score según reglas de negocio y actualizar esta tabla (y opcionalmente `scoring_history`).

### 5.2 (Opcional) `scoring_history`

Auditoría de cambios de score (útil para análisis y disputas).

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID/cuid | PK |
| `user_id` | UUID | FK → users |
| `previous_score` | int | |
| `new_score` | int | |
| `trigger` | string | Ej. `PAYMENT_ON_TIME`, `RECALCULATE`, `NEW_CREDIT` |
| `created_at` | timestamp | |

---

## 6. Diagrama de relaciones (resumen)

```
users
  ├── credit_profiles (1:1)
  ├── credits (1:N)
  └── payments (1:N)  [redundante user_id para consultas]

credits
  ├── credit_schedule (1:N)
  └── payments (1:N)

credit_schedule
  └── payments (1:N) [schedule_item_id opcional]
```

---

## 7. Decisiones a tener en cuenta

1. **Nomenclatura**: en el código actual está `loans` y `amortization_items`; en la API de Contexts.md se habla de “credits” y “schedule”. Se puede:
   - Mantener nombres de tabla `loans` / `amortization_items` y mapear en la API a “credits”, o
   - Renombrar tablas a `credits` y `credit_schedule` para alinear con el dominio.

2. **Soft delete**: usar `users.deleted_at` y `users.status` para no borrar filas y poder mantener integridad referencial e historial.

3. **Rol admin**: campo `users.role` (USER/ADMIN) es suficiente para PATCH approve/reject; si crece la cantidad de roles, pasar a tabla `roles` + `user_roles`.

4. **user_id en payments**: redundante con `credit_id → credits → user_id`, pero simplifica “todos los pagos del usuario” y deja el modelo listo para posibles pagos futuros no atados a un único crédito.

Cuando decidas qué variante quieres (nombres de tablas, soft delete, scoring_history sí/no), se puede bajar esto a un schema concreto (por ejemplo Prisma) en un siguiente paso.
