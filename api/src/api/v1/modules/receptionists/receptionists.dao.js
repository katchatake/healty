const { models } = require("../../../../db/database");

const getAll = async () => {
  return await models.receptionists.findAll({
    include: [
      {
        model: models.users,
        as: "user",
        attributes: { exclude: ["password"] },
      },
      {
        model: models.professionals,
        as: "assigned_to_professional",
      },
    ],
  });
};

const getById = async (id) => {
  return await models.receptionists.findByPk(id, {
    include: [
      {
        model: models.users,
        as: "user",
        attributes: { exclude: ["password"] },
      },
      {
        model: models.professionals,
        as: "assigned_to_professional",
      },
    ],
  });
};

const getByUserId = async (user_id) => {
  return await models.receptionists.findOne({
    where: { user_id },
  });
};

const create = async (data) => {
  return await models.receptionists.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.receptionists.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.receptionists.destroy({
    where: { id },
  });
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  getByUserId,
  create,
  update,
  deleteById,
};
