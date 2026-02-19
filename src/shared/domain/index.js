/**
 * Shared domain: helpers y enums usados por varios Bounded Contexts.
 */
const helpers = require('./helpers');
const enums = require('./enums');

module.exports = {
  ...helpers,
  enums,
};
