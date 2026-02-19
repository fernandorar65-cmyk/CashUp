/**
 * Puerto: persistencia de registros de auditoría.
 */

/**
 * @param {object} data - { userId?, action, entityType, entityId, oldValues?, newValues?, ipAddress?, userAgent? }
 * @returns {Promise<object>}
 */
async function create(data) {
  throw new Error('IAuditLogRepository.create must be implemented');
}

module.exports = { create };
