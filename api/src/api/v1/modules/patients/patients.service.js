const Boom = require("@hapi/boom");
const patientsDao = require("./patients.dao");
const usersDao = require("../users/users.dao");
const logger = require("../../../../utils/logger");

const getAll = async () => {
  logger.info("Fetching all patients");
  return await patientsDao.getAll();
};

const getById = async (id) => {
  logger.info(`Fetching patient with ID: ${id}`);
  const patient = await patientsDao.getById(id);
  if (!patient) {
    throw Boom.notFound("Patient not found");
  }
  return patient;
};

const create = async (data) => {
  // Verificamos que el usuario exista
  const user = await usersDao.getById(data.user_id);
  if (!user || user.id === undefined) {
    logger.warn(`Attempt to create patient with non-existent user_id: ${data.user_id}`);
    throw Boom.badRequest("User does not exist");
  }

  // Verificamos si ya existe un perfil para este usuario
  const existingProfile = await patientsDao.getByUserId(data.user_id);
  if (existingProfile) {
    logger.warn(`User ${data.user_id} already has a patient profile`);
    throw Boom.badRequest("This user already has a patient profile");
  }

  const patient = await patientsDao.create(data);
  logger.info(`Patient created successfully with ID: ${patient.id}`);
  return patient;
};

const update = async (id, data) => {
  const patient = await patientsDao.getById(id);
  if (!patient) {
    throw Boom.notFound("Patient not found");
  }

  // Si intentan cambiar el user_id, validamos que no exista otro perfil con ese user_id
  if (data.user_id && data.user_id !== patient.user_id) {
     const existingProfile = await patientsDao.getByUserId(data.user_id);
     if (existingProfile) {
       throw Boom.badRequest("The target user already has a patient profile");
     }
  }

  await patientsDao.update(id, data);
  logger.info(`Patient updated with ID: ${id}`);
  return await patientsDao.getById(id);
};

const deleteById = async (id) => {
  const patient = await patientsDao.getById(id);
  if (!patient) {
    throw Boom.notFound("Patient not found");
  }

  await patientsDao.deleteById(id);
  logger.info(`Patient deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteById,
};
