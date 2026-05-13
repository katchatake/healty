const { models } = require("../../../../config/database");

const getAll = async () => {
  return await models.professionals.findAll({
    include: [
      {
        model: models.users,
        as: "user",
        attributes: { exclude: ["password"] },
      },
    ],
  });
};

const getById = async (id) => {
  return await models.professionals.findByPk(id, {
    include: [
      {
        model: models.users,
        as: "user",
        attributes: { exclude: ["password"] },
      },
    ],
  });
};

const getByUserId = async (user_id) => {
  return await models.professionals.findOne({
    where: { user_id },
  });
};

const create = async (data) => {
  return await models.professionals.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.professionals.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.professionals.destroy({
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
