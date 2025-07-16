const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),

  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

  verifyRefreshToken: (token) => {
    if (!token) {
      throw new InvariantError('Refresh token tidak tersedia'); // 400
    }

    // Jika token invalid (rusak, salah tanda tangan, expired), akan dilempar dari sini:
    return Jwt.token.verify(token, process.env.REFRESH_TOKEN_KEY);
  },

  decodePayload: (token) => Jwt.token.decode(token).decoded.payload,
};

module.exports = TokenManager;