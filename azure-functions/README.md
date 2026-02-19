# CashUp – Azure Functions (opcional)

Puedes exponer lógica de CashUp como **Azure Functions** para:

- **Webhooks** o eventos (ej. notificar mora, recordatorios de pago).
- **Tareas programadas** (ej. actualizar estados de cuotas vencidas, enviar reportes).
- **HTTP** que delegue a la API Express o replique endpoints.

## Ejemplo de función HTTP

En la raíz del repo está la API principal en Express. Para usar Azure Functions:

1. Instalar Azure Functions Core Tools y crear un proyecto (si no existe).
2. Crear una función que llame a tu API CashUp (por URL) o que use Prisma/credit scoring en un entorno serverless.

Ejemplo mínimo de función que llama a la API:

```javascript
// azure-functions/NotifyOverdue/index.js
module.exports = async function (context, req) {
  const apiUrl = process.env.CASHUP_API_URL || 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/api/internal/overdue-check`, {
    headers: { 'x-api-key': process.env.INTERNAL_API_KEY },
  });
  const data = await res.json();
  context.res = { body: data };
};
```

Para tareas programadas usa un **Timer Trigger** (CRON) en lugar de HTTP.

La base del negocio (scoring, préstamos, amortización, pagos) sigue en **Node.js + Express + Prisma**; Azure Functions actúa como capa de eventos y jobs.
