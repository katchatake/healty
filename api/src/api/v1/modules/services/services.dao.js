const { models } = require("../../../../db/database");

const getAll = async () => {
  return await models.services.findAll({
    include: [
      {
        model: models.professionals,
        as: "professional",
      },
    ],
  });
};

const getById = async (id) => {
  return await models.services.findByPk(id, {
    include: [
      {
        model: models.professionals,
        as: "professional",
      },
    ],
  });
};

const getByProfessionalId = async (professional_id) => {
  return await models.services.findAll({
    where: { professional_id },
  });
};

const create = async (data) => {
  return await models.services.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.services.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.services.destroy({
    where: { id },
  });
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  getByProfessionalId,
  create,
  update,
  deleteById,
};
