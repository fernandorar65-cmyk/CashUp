# Esquema de tablas – CashUp (según descripcion.md)

Diseño de base de datos para la plataforma de gestión de préstamos: clientes, préstamos (simple/compuesto), refinanciamientos, cuotas, pagos (parciales/totales), mora configurable, scoring, verificaciones externas, cobranza, auditoría y roles.

---

## Resumen de tablas

| # | Tabla | Propósito |
|---|--------|-----------|
| 1 | **clients** | Clientes que solicitan préstamos |
| 2 | **loans** | Préstamos (monto, tasa, plazo, tipo interés, estado) |
| 3 | **loan_refinances** | Refinanciamientos (préstamo original → nuevo) |
| 4 | **installments** | Cuotas de cada préstamo |
| 5 | **payments** | Pagos recibidos (efectivo recibido) |
| 6 | **payment_applications** | Distribución de un pago entre cuotas (parciales/múltiples) |
| 7 | **late_fees** | Penalidades por atraso en cuotas |
| 8 | **loan_charges** | Cargos adicionales (comisiones, seguros, gastos) |
| 9 | **penalty_policies** | Reglas de mora (%, días gracia, tipo de cálculo) |
| 10 | **collection_actions** | Gestiones de cobranza |
| 11 | **loan_history** | Historial de cambios del préstamo |
| 12 | **credit_evaluations** | Evaluaciones de riesgo pre-aprobación |
| 13 | **client_background_checks** | Verificaciones externas (judiciales, listas riesgo) |
| 14 | **external_debts** | Deudas externas del cliente (endeudamiento) |
| 15 | **credit_score_history** | Historial del puntaje del cliente |
| 16 | **users** | Usuarios del sistema (admin, analistas, cobradores) |
| 17 | **roles** | Roles/perfiles de permisos |
| 18 | **user_roles** | Relación usuario–rol |
| 19 | **audit_logs** | Auditoría de acciones críticas |

---

## 1. clients

Información de los clientes que solicitan préstamos.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| document_id | string | Unique (DNI/identificación) |
| document_type | string | Ej. DNI, RUC, pasaporte |
| first_name | string | |
| last_name | string | |
| email | string | Unique, no nullable |
| phone | string | Nullable |
| monthly_income | decimal(12,2) | Para scoring y capacidad de pago |
| address | string | Nullable |
| status | enum | ACTIVE, INACTIVE, BLOCKED |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp | Nullable, soft delete |

---

## 2. loans

Préstamos con condiciones financieras (interés simple o compuesto).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| amount | decimal(12,2) | Monto desembolsado |
| term_months | int | Plazo en meses |
| interest_rate | decimal(5,4) | Tasa anual (ej. 0.24 = 24%) |
| interest_type | enum | SIMPLE, COMPOUND |
| monthly_payment | decimal(12,2) | Cuota mensual calculada |
| total_to_pay | decimal(12,2) | Total principal + intereses |
| status | enum | PENDING, APPROVED, REJECTED, ACTIVE, PAID, DEFAULTED, REFINANCED |
| penalty_policy_id | UUID | FK → penalty_policies, nullable (mora por defecto) |
| credit_evaluation_id | UUID | FK → credit_evaluations, nullable |
| rejection_reason | string | Nullable |
| approved_at | timestamp | Nullable |
| approved_by | UUID | FK → users, nullable |
| disbursed_at | timestamp | Nullable |
| due_date | date | Última cuota |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 3. loan_refinances

Vincula un préstamo original con el nuevo (refinanciamiento).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| original_loan_id | UUID | FK → loans, not null |
| new_loan_id | UUID | FK → loans, not null, unique |
| reason | string | Nullable (motivo del refinanciamiento) |
| created_at | timestamp | |
| created_by | UUID | FK → users, nullable |

---

## 4. installments

Cuotas generadas por cada préstamo (obligación periódica de pago).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| loan_id | UUID | FK → loans, not null |
| installment_number | int | 1..N |
| due_date | date | Vencimiento |
| principal | decimal(12,2) | Amortización capital |
| interest | decimal(12,2) | Interés de la cuota |
| total_due | decimal(12,2) | principal + interest (sin mora) |
| paid_principal | decimal(12,2) | Default 0 |
| paid_interest | decimal(12,2) | Default 0 |
| paid_late_fee | decimal(12,2) | Default 0 |
| status | enum | PENDING, PARTIAL, PAID, OVERDUE, CANCELLED |
| paid_at | timestamp | Nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

*(El monto de mora se calcula según penalty_policy y se registra en late_fees; el total a pagar por cuota = total_due + sum(late_fees no pagados).)*

---

## 5. payments

Pagos realizados por los clientes (dinero efectivamente recibido).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| loan_id | UUID | FK → loans, not null |
| amount | decimal(12,2) | Monto total del pago |
| payment_method | string | Efectivo, transferencia, etc. |
| reference | string | Número de operación / referencia |
| paid_at | timestamp | Fecha/hora del pago |
| created_at | timestamp | |
| created_by | UUID | FK → users, nullable |

La distribución del pago entre cuotas va en **payment_applications**.

---

## 6. payment_applications

Distribución de un pago entre una o varias cuotas (pagos parciales o a múltiples cuotas).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| payment_id | UUID | FK → payments, not null |
| installment_id | UUID | FK → installments, not null |
| amount_applied | decimal(12,2) | Monto aplicado a esta cuota |
| applied_to_principal | decimal(12,2) | Porción a capital |
| applied_to_interest | decimal(12,2) | Porción a interés |
| applied_to_late_fee | decimal(12,2) | Porción a mora |
| created_at | timestamp | |

Un mismo `payment_id` puede tener varias filas (una por cuota afectada). La suma de `amount_applied` por `payment_id` debe ser ≤ `payments.amount`.

---

## 7. late_fees

Penalidades o intereses por atraso en cuotas vencidas.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| installment_id | UUID | FK → installments, not null |
| amount | decimal(12,2) | Monto de la penalidad |
| period_from | date | Inicio del período de mora |
| period_to | date | Fin del período (o hasta pago) |
| policy_id | UUID | FK → penalty_policies, nullable |
| created_at | timestamp | |

Se actualiza el cobro de mora según la política; el pago de esa mora se refleja en **payment_applications** (applied_to_late_fee) y en **installments** (paid_late_fee).

---

## 8. loan_charges

Cargos adicionales del préstamo (comisiones, seguros, gastos administrativos).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| loan_id | UUID | FK → loans, not null |
| charge_type | enum | COMMISSION, INSURANCE, ADMIN_FEE, OTHER |
| description | string | Nullable |
| amount | decimal(12,2) | Not null |
| applied_at | timestamp | Default now() |
| created_at | timestamp | |

---

## 9. penalty_policies

Reglas configurables para el cálculo de mora.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| name | string | Ej. "Mora estándar 1%" |
| rate | decimal(5,4) | Porcentaje aplicable (ej. 0.01 = 1%) |
| grace_days | int | Días de gracia antes de aplicar mora |
| calculation_type | enum | PERCENTAGE_ON_BALANCE, PERCENTAGE_ON_OVERDUE, FLAT_DAILY |
| is_default | boolean | Si es la política por defecto del sistema |
| created_at | timestamp | |
| updated_at | timestamp | |

`loans.penalty_policy_id` puede apuntar aquí; si es null, se usa la política con `is_default = true`.

---

## 10. collection_actions

Gestiones de cobranza a clientes con cuotas vencidas.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| loan_id | UUID | FK → loans, nullable (gestión por préstamo o global) |
| action_type | enum | CALL, EMAIL, VISIT, NOTICE, LEGAL |
| outcome | string | Nullable (resultado de la gestión) |
| note | string | Nullable |
| action_date | date | |
| created_by | UUID | FK → users, nullable |
| created_at | timestamp | |

---

## 11. loan_history

Historial de cambios importantes del préstamo (estado, tasa, condiciones).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| loan_id | UUID | FK → loans, not null |
| field_changed | string | Nombre del campo (ej. status, interest_rate) |
| old_value | string | Valor anterior (serializado si es necesario) |
| new_value | string | Valor nuevo |
| changed_at | timestamp | |
| changed_by | UUID | FK → users, nullable |

---

## 12. credit_evaluations

Evaluaciones de riesgo crediticio antes de aprobar un préstamo.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| score | int | Puntaje (ej. 0–100) |
| result | enum | APPROVED, REJECTED |
| factors | string/json | Nullable (detalle de factores considerados) |
| evaluated_at | timestamp | |
| evaluated_by | UUID | FK → users, nullable |

`loans.credit_evaluation_id` puede referenciar esta tabla.

---

## 13. client_background_checks

Verificaciones externas (judiciales, listas de riesgo) sin almacenar datos sensibles detallados.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| check_type | enum | JUDICIAL, RISK_LIST, EXTERNAL_VALIDATION |
| result | enum | PASS, FAIL, PENDING |
| reference_id | string | Nullable (id en sistema externo, no datos sensibles) |
| checked_at | timestamp | |
| created_at | timestamp | |

---

## 14. external_debts

Deudas externas del cliente para calcular nivel de endeudamiento.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| source | string | Nullable (origen: otro banco, retail, etc.) |
| amount | decimal(12,2) | Monto de la deuda |
| currency | string | Default 'PEN' o según negocio |
| reported_at | timestamp | |
| created_at | timestamp | |

---

## 15. credit_score_history

Historial del puntaje de riesgo del cliente en el tiempo.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| client_id | UUID | FK → clients, not null |
| score | int | Puntaje en ese momento |
| trigger | string | Nullable (RECALCULATE, PAYMENT, NEW_LOAN, etc.) |
| recorded_at | timestamp | |
| created_at | timestamp | |

*(Opcional: se puede mantener también un “score actual” en una tabla tipo client_credit_profile (1:1 con clients) para no leer siempre el último registro del historial.)*

---

## 16. users

Usuarios del sistema (administradores, analistas, cobradores).

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| email | string | Unique, not null |
| password_hash | string | Not null |
| first_name | string | |
| last_name | string | |
| status | enum | ACTIVE, INACTIVE, LOCKED |
| created_at | timestamp | |
| updated_at | timestamp | |
| deleted_at | timestamp | Nullable |

Los permisos se definen vía **roles** y **user_roles**. Opcional: si los clientes también entran al sistema, se puede tener `client_id` nullable en users para vincular usuario de portal con cliente.

---

## 17. roles

Roles o perfiles que definen permisos.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| name | string | Unique (ADMIN, ANALYST, COLLECTOR, etc.) |
| description | string | Nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 18. user_roles

Relación entre usuarios y roles (N:N).

| Campo | Tipo | Notas |
|-------|------|--------|
| user_id | UUID | FK → users, PK |
| role_id | UUID | FK → roles, PK |
| assigned_at | timestamp | |
| assigned_by | UUID | FK → users, nullable |

---

## 19. audit_logs

Registro de acciones críticas para auditoría y trazabilidad.

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID/cuid | PK |
| user_id | UUID | FK → users, nullable (si la acción fue por sistema) |
| action | string | Ej. LOAN_APPROVE, PAYMENT_REGISTER |
| entity_type | string | Ej. loan, payment, client |
| entity_id | string | ID del registro afectado |
| old_values | jsonb | Nullable (estado anterior) |
| new_values | jsonb | Nullable (estado nuevo) |
| ip_address | string | Nullable |
| user_agent | string | Nullable |
| created_at | timestamp | |

---

## Diagrama de relaciones (resumen)

```
clients
  ├── loans (1:N)
  ├── payments (1:N)
  ├── payment_applications (vía payments)
  ├── credit_evaluations (1:N)
  ├── client_background_checks (1:N)
  ├── external_debts (1:N)
  ├── credit_score_history (1:N)
  └── collection_actions (1:N)

loans
  ├── loan_refinances (original_loan_id, new_loan_id)
  ├── installments (1:N)
  ├── payments (1:N)
  ├── loan_charges (1:N)
  ├── loan_history (1:N)
  └── penalty_policies (N:1, opcional)

installments
  ├── payment_applications (1:N)
  └── late_fees (1:N)

payments
  └── payment_applications (1:N)

users
  ├── user_roles (1:N)
  ├── audit_logs (1:N)
  └── referencias en loans (approved_by), collection_actions (created_by), etc.
```

---

## Notas de implementación

1. **Clientes vs usuarios**: `clients` son los deudores; `users` son el personal. Si más adelante los clientes entran a un portal, se puede añadir `client_id` en `users` o unificar con cuidado.
2. **Pagos parciales**: Un `payment` se reparte en varias filas de `payment_applications`; cada fila actualiza el `installment` correspondiente (paid_principal, paid_interest, paid_late_fee, status).
3. **Mora**: Se calcula con `penalty_policies` y se registra en `late_fees` por período/cuota; el pago de mora va en `payment_applications.applied_to_late_fee`.
4. **Refinanciamiento**: `loan_refinances` enlaza préstamo viejo y nuevo; el préstamo original puede pasar a status REFINANCED.
5. **Score actual**: Se puede tener una tabla `client_credit_profiles` (client_id, score, risk_level, last_calculated_at) y seguir guardando historial en `credit_score_history`.

Cuando quieras, este esquema se puede bajar a un `schema.prisma` o a scripts SQL concretos.
