const Boom = require("@hapi/boom");
const servicesDao = require("./services.dao");
const professionalDao = require("../professional/professional.dao");
const logger = require("../../../../utils/logger");

const getAll = async () => {
  logger.info("Fetching all services");
  return await servicesDao.getAll();
};

const getById = async (id) => {
  logger.info(`Fetching service with ID: ${id}`);
  const service = await servicesDao.getById(id);
  if (!service) {
    throw Boom.notFound("Service not found");
  }
  return service;
};

const getByProfessionalId = async (professional_id) => {
  logger.info(`Fetching services for professional ID: ${professional_id}`);
  return await servicesDao.getByProfessionalId(professional_id);
};

const create = async (data) => {
  // Verificamos que el profesional exista
  const professional = await professionalDao.getById(data.professional_id);
  if (!professional || professional.id === undefined) {
    logger.warn(`Attempt to create service with non-existent professional_id: ${data.professional_id}`);
    throw Boom.badRequest("Professional does not exist");
  }

  const service = await servicesDao.create(data);
  logger.info(`Service created successfully with ID: ${service.id}`);
  return service;
};

const update = async (id, data) => {
  const service = await servicesDao.getById(id);
  if (!service) {
    throw Boom.notFound("Service not found");
  }

  if (data.professional_id && data.professional_id !== service.professional_id) {
    const professional = await professionalDao.getById(data.professional_id);
    if (!professional || professional.id === undefined) {
        throw Boom.badRequest("Professional does not exist");
    }
  }

  await servicesDao.update(id, data);
  logger.info(`Service updated with ID: ${id}`);
  return await servicesDao.getById(id);
};

const deleteById = async (id) => {
  const service = await servicesDao.getById(id);
  if (!service) {
    throw Boom.notFound("Service not found");
  }

  await servicesDao.deleteById(id);
  logger.info(`Service deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAll,
  getById,
  getByProfessionalId,
  create,
  update,
  deleteById,
};
