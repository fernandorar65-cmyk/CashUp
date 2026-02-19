const { toNumber, toDate } = require('../../../shared/domain/helpers');

/**
 * Entidad de dominio (Risk & Scoring): Cliente (solicitante de préstamos).
 */
class Client {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.documentId = data.documentId ?? data.document_id ?? null;
    this.documentType = data.documentType ?? data.document_type ?? null;
    this.firstName = data.firstName ?? data.first_name ?? null;
    this.lastName = data.lastName ?? data.last_name ?? null;
    this.email = data.email ?? null;
    this.phone = data.phone ?? null;
    this.monthlyIncome = toNumber(data.monthlyIncome ?? data.monthly_income);
    this.address = data.address ?? null;
    this.status = data.status ?? null;
    this.createdAt = toDate(data.createdAt ?? data.created_at);
    this.updatedAt = toDate(data.updatedAt ?? data.updated_at);
    this.deletedAt = toDate(data.deletedAt ?? data.deleted_at);
  }

  toObject() {
    return { ...this };
  }
}

module.exports = Client;
