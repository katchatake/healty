const jwt = require("jsonwebtoken");
const Boom = require("@hapi/boom");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expecting "Bearer TOKEN"

  if (!token) {
    return next(Boom.unauthorized("No token provided"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(Boom.forbidden("Invalid or expired token"));
    }
    req.user = decoded;
    next();
  });
};

const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(Boom.unauthorized("Authentication required"));
    }

    const userRoles = req.user.roles || [];
    const hasPermission = roles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return next(Boom.forbidden("Insufficient permissions"));
    }

    next();
  };
};

module.exports = {
  verifyToken,
  hasRole,
};
