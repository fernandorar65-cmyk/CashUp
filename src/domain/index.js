/**
 * Capa de dominio – CashUp
 * Entidades, value objects, domain services, interfaces de repositorios.
 */

const entities = require('./entities');
const { CreditScoringDomainService, AmortizationDomainService } = require('./services');
const valueObjects = {
  CreditScoringConfig: require('./value-objects/CreditScoringConfig'),
};
const repositories = require('./repositories');

module.exports = {
  entities,
  valueObjects,
  services: {
    CreditScoringDomainService,
    AmortizationDomainService,
  },
  repositories,
};
