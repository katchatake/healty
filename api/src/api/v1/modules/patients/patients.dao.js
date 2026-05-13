const { models } = require("../../../../db/database");

const getAll = async () => {
  return await models.patients.findAll({
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
  return await models.patients.findByPk(id, {
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
  return await models.patients.findOne({
    where: { user_id },
  });
};

const create = async (data) => {
  return await models.patients.create(data);
};

const update = async (id, data) => {
  const [rowsUpdated] = await models.patients.update(data, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.patients.destroy({
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
