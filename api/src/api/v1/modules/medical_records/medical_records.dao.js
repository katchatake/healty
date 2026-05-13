const { models } = require("../../../../config/database");

const getAll = async () => {
  return await models.medical_records.findAll({
    include: [
      { model: models.patients, as: "patient" },
      { model: models.professionals, as: "professional" },
    ],
    order: [['created_date', 'DESC']],
  });
};

const getById = async (id) => {
  return await models.medical_records.findByPk(id, {
    include: [
      { model: models.patients, as: "patient" },
      { model: models.professionals, as: "professional" },
    ],
  });
};

const getByPatientId = async (patient_id) => {
  return await models.medical_records.findAll({
    where: { patient_id },
    include: [
      { model: models.professionals, as: "professional" },
    ],
    order: [['created_date', 'DESC']],
  });
};

const create = async (data) => {
  return await models.medical_records.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.medical_records.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.medical_records.destroy({
    where: { id },
  });
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  getByPatientId,
  create,
  update,
  deleteById,
};
