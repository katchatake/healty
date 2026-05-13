const { models } = require("../../../../db/database");

const getAll = async () => {
  return await models.appointments.findAll({
    include: [
      { model: models.patients, as: "patient" },
      { model: models.professionals, as: "professional" },
      { model: models.services, as: "service" },
    ],
    order: [['appointment_date', 'DESC']],
  });
};

const getById = async (id) => {
  return await models.appointments.findByPk(id, {
    include: [
      { model: models.patients, as: "patient" },
      { model: models.professionals, as: "professional" },
      { model: models.services, as: "service" },
    ],
  });
};

const getByPatientId = async (patient_id) => {
  return await models.appointments.findAll({
    where: { patient_id },
    include: [
      { model: models.professionals, as: "professional" },
      { model: models.services, as: "service" },
    ],
    order: [['appointment_date', 'DESC']],
  });
};

const getByProfessionalId = async (professional_id) => {
  return await models.appointments.findAll({
    where: { professional_id },
    include: [
      { model: models.patients, as: "patient" },
      { model: models.services, as: "service" },
    ],
    order: [['appointment_date', 'DESC']],
  });
};

const create = async (data) => {
  return await models.appointments.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.appointments.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.appointments.destroy({
    where: { id },
  });
  return rowsDeleted > 0;
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
