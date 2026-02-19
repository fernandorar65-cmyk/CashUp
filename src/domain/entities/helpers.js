/**
 * Helpers para mapear valores de persistencia (Prisma) a dominio.
 */
function toNumber(value) {
  if (value == null) return null;
  return typeof value === 'object' && typeof value.toNumber === 'function' ? value.toNumber() : Number(value);
}

function toDate(value) {
  if (value == null) return null;
  return value instanceof Date ? value : new Date(value);
}

module.exports = { toNumber, toDate };
