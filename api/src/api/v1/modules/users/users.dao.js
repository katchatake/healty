const { models } = require("../../../../config/database");

const getAll = async () => {
  let user_roles = await models.user_roles.findAll({
    attributes: [],
    raw: true,
    nest: true,
    include: [
      {
        model: models.users,
        as: "user",
        attributes: { exclude: ["password"] },
      },
      {
        model: models.roles,
        as: "role",
        attributes: ["id", "name"],
      },
    ],
  });
  const formattedResponse = user_roles.map((item) => {
    return {
      ...item.user,
      role: item.role,
    };
  });
  return formattedResponse;
};

const getById = async (id) => {
  const user_roles = await models.user_roles.findByPk(id, {
    attributes: [],
    raw: true,
    nest: true,
    include: [
      {
        model: models.users,
        as: "user",
        attributes: { exclude: ["password"] },
        where: { id },
      },
      {
        model: models.roles,
        as: "role",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!user_roles) {
    const user = await models.users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    let res = user.toJSON();
    res.role = null;
    return res;
  }

  return {
    ...user_roles.user,
    role: user_roles.role,
  };
};

const findByEmail = async (email) => {
  return await models.users.findOne({
    where: { email },
  });
};

const create = async (userData) => {
  return await models.users.create(userData);
};

const update = async (id, userData) => {
  const [rowsUpdated] = await models.users.update(userData, {
    where: { id },
  });
  return rowsUpdated > 0;
};

const deleteById = async (id) => {
  const rowsDeleted = await models.users.destroy({
    where: { id },
  });
  return rowsDeleted > 0;
};

module.exports = {
  getAll,
  getById,
  findByEmail,
  create,
  update,
  deleteById,
};
