const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class BcryptPasswordHasher {
  async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verify(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = BcryptPasswordHasher;
