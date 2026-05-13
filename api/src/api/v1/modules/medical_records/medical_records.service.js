const Boom = require("@hapi/boom");
const medicalRecordsDao = require("./medical_records.dao");
const patientsDao = require("../patients/patients.dao");
const professionalDao = require("../professional/professional.dao");
const appointmentsDao = require("../appointments/appointments.dao");
const logger = require("../../../../utils/logger");

const getAll = async () => {
  logger.info("Fetching all medical records");
  return await medicalRecordsDao.getAll();
};

const getById = async (id) => {
  logger.info(`Fetching medical record with ID: ${id}`);
  const record = await medicalRecordsDao.getById(id);
  if (!record) {
    throw Boom.notFound("Medical record not found");
  }
  return record;
};

const getByPatientId = async (patient_id) => {
  logger.info(`Fetching medical records for patient ID: ${patient_id}`);
  return await medicalRecordsDao.getByPatientId(patient_id);
};

const create = async (data) => {
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

  // 3. Verificamos que la cita exista (si se proporcionó)
  if (data.appointment_id) {
    const appointment = await appointmentsDao.getById(data.appointment_id);
    if (!appointment || appointment.id === undefined) {
      throw Boom.badRequest("Appointment does not exist");
    }
  }

  const record = await medicalRecordsDao.create(data);
  logger.info(`Medical record created successfully with ID: ${record.id}`);
  return record;
};

const update = async (id, data) => {
  const record = await medicalRecordsDao.getById(id);
  if (!record) {
    throw Boom.notFound("Medical record not found");
  }

  await medicalRecordsDao.update(id, data);
  logger.info(`Medical record updated with ID: ${id}`);
  return await medicalRecordsDao.getById(id);
};

const deleteById = async (id) => {
  const record = await medicalRecordsDao.getById(id);
  if (!record) {
    throw Boom.notFound("Medical record not found");
  }

  await medicalRecordsDao.deleteById(id);
  logger.info(`Medical record deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAll,
  getById,
  getByPatientId,
  create,
  update,
  deleteById,
};
