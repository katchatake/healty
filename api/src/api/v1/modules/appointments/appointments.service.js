const Boom = require("@hapi/boom");
const appointmentsDao = require("./appointments.dao");
const patientsDao = require("../patients/patients.dao");
const professionalDao = require("../professional/professional.dao");
const servicesDao = require("../services/services.dao");
const logger = require("../../../../utils/logger");

const getAll = async () => {
  logger.info("Fetching all appointments");
  return await appointmentsDao.getAll();
};

const getById = async (id) => {
  logger.info(`Fetching appointment with ID: ${id}`);
  const appointment = await appointmentsDao.getById(id);
  if (!appointment) {
    throw Boom.notFound("Appointment not found");
  }
  return appointment;
};

const getByPatientId = async (patient_id) => {
  logger.info(`Fetching appointments for patient ID: ${patient_id}`);
  return await appointmentsDao.getByPatientId(patient_id);
};

const getByProfessionalId = async (professional_id) => {
  logger.info(`Fetching appointments for professional ID: ${professional_id}`);
  return await appointmentsDao.getByProfessionalId(professional_id);
};

const create = async (data, user_id) => {
  // 1. Verificamos que el paciente exista
  const patient = await patientsDao.getById(data.patient_id);
  if (!patient || patient.id === undefined) {
    throw Boom.badRequest("Patient does not exist");
  }

  // 2. Verificamos que el profesional exista
  const professional = await professionalDao.getById(data.professional_id);
  if (!professional || professional.id === undefined) {
    throw Boom.badRequest("Professional does not exist");
  }

  // 3. Verificamos que el servicio exista
  const service = await servicesDao.getById(data.service_id);
  if (!service || service.id === undefined) {
    throw Boom.badRequest("Service does not exist");
  }

  // Injectamos el usuario que está creando la cita (sacado del token)
  data.created_by = user_id;

  const appointment = await appointmentsDao.create(data);
  logger.info(`Appointment created successfully with ID: ${appointment.id}`);
  return appointment;
};

const update = async (id, data) => {
  const appointment = await appointmentsDao.getById(id);
  if (!appointment) {
    throw Boom.notFound("Appointment not found");
  }

  await appointmentsDao.update(id, data);
  logger.info(`Appointment updated with ID: ${id}`);
  return await appointmentsDao.getById(id);
};

const deleteById = async (id) => {
  const appointment = await appointmentsDao.getById(id);
  if (!appointment) {
    throw Boom.notFound("Appointment not found");
  }

  await appointmentsDao.deleteById(id);
  logger.info(`Appointment deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAll,
  getById,
  getByPatientId,
  getByProfessionalId,
  create,
  update,
  deleteById,
};
