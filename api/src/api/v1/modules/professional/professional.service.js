const Boom = require("@hapi/boom");
const professionalDao = require("./professional.dao");
const usersDao = require("../users/users.dao");
const logger = require("../../../../utils/logger");

const getAll = async () => {
  logger.info("Fetching all professionals");
  return await professionalDao.getAll();
};

const getById = async (id) => {
  logger.info(`Fetching professional with ID: ${id}`);
  const professional = await professionalDao.getById(id);
  if (!professional) {
    throw Boom.notFound("Professional not found");
  }
  return professional;
};

const create = async (data) => {
  // Verificamos que el usuario exista
  const user = await usersDao.getById(data.user_id);
  if (!user || user.id === undefined) {
    logger.warn(`Attempt to create professional with non-existent user_id: ${data.user_id}`);
    throw Boom.badRequest("User does not exist");
  }

  // Verificamos si ya existe un perfil para este usuario
  const existingProfile = await professionalDao.getByUserId(data.user_id);
  if (existingProfile) {
    logger.warn(`User ${data.user_id} already has a professional profile`);
    throw Boom.badRequest("This user already has a professional profile");
  }

  const professional = await professionalDao.create(data);
  logger.info(`Professional created successfully with ID: ${professional.id}`);
  return professional;
};

const update = async (id, data) => {
  const professional = await professionalDao.getById(id);
  if (!professional) {
    throw Boom.notFound("Professional not found");
  }

  // Si intentan cambiar el user_id, validamos que no exista otro perfil con ese user_id
  if (data.user_id && data.user_id !== professional.user_id) {
     const existingProfile = await professionalDao.getByUserId(data.user_id);
     if (existingProfile) {
       throw Boom.badRequest("The target user already has a professional profile");
     }
  }

  await professionalDao.update(id, data);
  logger.info(`Professional updated with ID: ${id}`);
  return await professionalDao.getById(id);
};

const deleteById = async (id) => {
  const professional = await professionalDao.getById(id);
  if (!professional) {
    throw Boom.notFound("Professional not found");
  }

  await professionalDao.deleteById(id);
  logger.info(`Professional deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById,
};
