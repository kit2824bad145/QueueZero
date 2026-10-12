const jwt = require('jsonwebtoken');

// Signs a JWT that carries the user's id and role so middleware can
// authenticate and authorize requests without another DB lookup for the role.
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
