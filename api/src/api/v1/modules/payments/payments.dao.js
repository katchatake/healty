const { models } = require("../../../../db/database");

const getAll = async () => {
  return await models.payments.findAll({
    include: [
      { model: models.appointments, as: "appointment" },
    ],
    order: [['created_date', 'DESC']],
  });
};

const getById = async (id) => {
  return await models.payments.findByPk(id, {
    include: [
      { model: models.appointments, as: "appointment" },
    ],
  });
};

const getByAppointmentId = async (appointment_id) => {
  return await models.payments.findAll({
    where: { appointment_id },
    order: [['created_date', 'DESC']],
  });
};

const create = async (data) => {
  return await models.payments.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.payments.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.payments.destroy({
    where: { id },
  });
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  getByAppointmentId,
  create,
  update,
  deleteById,
};
