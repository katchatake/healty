const Boom = require("@hapi/boom");
const receptionistsDao = require("./receptionists.dao");

const getAllReceptionists = async () => {
  return await receptionistsDao.getAll();
};

const getReceptionistById = async (id) => {
  const receptionist = await receptionistsDao.getById(id);
  if (!receptionist) {
    throw Boom.notFound("Receptionist not found");
  }
  return receptionist;
};

const createReceptionist = async (data) => {
  const existingProfile = await receptionistsDao.getByUserId(data.user_id);
  if (existingProfile) {
    throw Boom.badRequest("User already has a receptionist profile");
  }

  return await receptionistsDao.create(data);
};

const updateReceptionist = async (id, data) => {
  const receptionist = await receptionistsDao.getById(id);
  if (!receptionist) {
    throw Boom.notFound("Receptionist not found");
  }

  await receptionistsDao.update(id, data);
  return await receptionistsDao.getById(id);
};

const deleteReceptionist = async (id) => {
  const receptionist = await receptionistsDao.getById(id);
  if (!receptionist) {
    throw Boom.notFound("Receptionist not found");
  }

  await receptionistsDao.deleteById(id);
  return { id };
};

module.exports = {
  getAllReceptionists,
  getReceptionistById,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
};
