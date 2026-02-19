const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class BcryptPasswordHasher {
  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async compare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}

module.exports = BcryptPasswordHasher;
