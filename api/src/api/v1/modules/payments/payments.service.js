const Boom = require("@hapi/boom");
const paymentsDao = require("./payments.dao");
const appointmentsDao = require("../appointments/appointments.dao");
const logger = require("../../../../utils/logger");

const getAll = async () => {
  logger.info("Fetching all payments");
  return await paymentsDao.getAll();
};

const getById = async (id) => {
  logger.info(`Fetching payment with ID: ${id}`);
  const payment = await paymentsDao.getById(id);
  if (!payment) {
    throw Boom.notFound("Payment not found");
  }
  return payment;
};

const getByAppointmentId = async (appointment_id) => {
  logger.info(`Fetching payments for appointment ID: ${appointment_id}`);
  return await paymentsDao.getByAppointmentId(appointment_id);
};

const create = async (data) => {
  // 1. Verificamos que la cita exista
  const appointment = await appointmentsDao.getById(data.appointment_id);
  if (!appointment || appointment.id === undefined) {
    throw Boom.badRequest("Appointment does not exist");
  }

  // 2. Regla de Negocio: Prevención de Doble Cobro
  // Verificamos si la cita ya tiene un pago con estatus 'completed'
  const existingPayments = await paymentsDao.getByAppointmentId(data.appointment_id);
  const hasCompletedPayment = existingPayments.some(p => p.status === 'completed');
  
  if (hasCompletedPayment) {
    logger.warn(`Attempt to create a payment for appointment ${data.appointment_id} which is already paid`);
    throw Boom.conflict("This appointment already has a completed payment");
  }

  const payment = await paymentsDao.create(data);
  logger.info(`Payment created successfully with ID: ${payment.id}`);
  return payment;
};

const update = async (id, data) => {
  const payment = await paymentsDao.getById(id);
  if (!payment) {
    throw Boom.notFound("Payment not found");
  }

  await paymentsDao.update(id, data);
  logger.info(`Payment updated with ID: ${id}`);
  return await paymentsDao.getById(id);
};

const deleteById = async (id) => {
  const payment = await paymentsDao.getById(id);
  if (!payment) {
    throw Boom.notFound("Payment not found");
  }

  await paymentsDao.deleteById(id);
  logger.info(`Payment deleted with ID: ${id}`);
  return { id };
};

module.exports = {
  getAll,
  getById,
  getByAppointmentId,
  create,
  update,
  deleteById,
};
