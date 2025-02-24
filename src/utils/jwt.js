const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Función para crear un JWT
const createJWT = (data) => {
  return jwt.sign({ ...data }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiration });
};

// Función para crear una cookie
const createCookie = (res, name, value) => {
  const isProduction = !process.env.NODE_ENV || process.env.NODE_ENV !== 'development';
  res.cookie(name, value, {
    httpOnly: true,
    secure: isProduction, // Solo seguro en producción
    sameSite: isProduction ? 'None' : 'Lax', // 'None' para producción, 'Lax' para desarrollo
    maxAge: config.auth.jwtExpiration
  });
};

// Función para crear una cookie con JWT
const createJWTCookie = (res, data) => {
  const token = createJWT(data);
  createCookie(res, 'token', token);
};

// Función para verificar un JWT
const verifyJWT = (token) => {
  return jwt.verify(token, config.auth.jwtSecret);
};

module.exports = {
  createJWT,
  createCookie,
  createJWTCookie,
  verifyJWT
};