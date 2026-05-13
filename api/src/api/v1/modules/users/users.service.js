const bcrypt = require("bcryptjs");
const Boom = require("@hapi/boom");
const usersDao = require("./users.dao");
const logger = require("../../../../utils/logger");

const getAllUsers = async () => {
  logger.info("Fetching all users");
  return await usersDao.getAll();
};

const getUserById = async (id) => {
  logger.info(`Fetching user with ID: ${id}`);
  const user = await usersDao.getById(id);
  if (!user) {
    throw Boom.notFound("User not found");
  }
  return user;
};

const createUser = async (userData) => {
  const existingUser = await usersDao.findByEmail(userData.email);
  if (existingUser) {
    logger.warn(
      `Attempt to create user with existing email: ${userData.email}`,
    );
    throw Boom.badRequest("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await usersDao.create({
    ...userData,
    password: hashedPassword,
  });

  logger.info(`User created successfully with ID: ${user.id}`);
  const result = user.toJSON();
  delete result.password;
  return result;
};

const updateUser = async (id, userData) => {
  const user = await usersDao.getById(id);
  console.log(user);
  if (!user) {
    throw Boom.notFound("User not found");
  }

  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  await usersDao.update(id, userData);
  logger.info(`User updated with ID: ${id}`);
  return await usersDao.getById(id);
};

const deleteUser = async (id) => {
  const user = await usersDao.getById(id);
  if (!user) {
    throw Boom.notFound("User not found");
  }

  await usersDao.deleteById(id);
  logger.info(`User deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
