const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Boom = require("@hapi/boom");
const authDao = require("./auth.dao");

const login = async (email, password) => {
  const user = await authDao.findByEmail(email);
  if (!user) {
    throw Boom.unauthorized("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw Boom.unauthorized("Invalid email or password");
  }

  const roles = await authDao.rolesByUserId(user.id);

  const payload = {
    id: user.id,
    email: user.email,
    roles: roles,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  // Remove password from response
  const userResponse = user;
  delete userResponse.password;

  return {
    user: userResponse,
    token,
  };
};

module.exports = {
  login,
};
