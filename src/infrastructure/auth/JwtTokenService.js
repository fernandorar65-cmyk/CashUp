const jwt = require('jsonwebtoken');
const config = require('../../config');

class JwtTokenService {
  generate(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, config.jwt.secret);
  }
}

module.exports = JwtTokenService;
