const { models } = require("../../../../db/database");

const findByEmail = async (email) => {
  let user = await models.users.findOne({
    where: { email },
  });
  return user ? user.toJSON() : null;
};

const rolesByUserId = async (userId) => {
  models.user_roles.belongsTo(models.roles, {
    foreignKey: "role_id",
  });
  let roles = await models.user_roles.findAll({
    where: { user_id: userId },
    attributes: [],
    include: [
      {
        model: models.roles,
        attributes: ["name"],
      },
    ],
  });
  return roles.length > 0 ? roles.map((role) => role.toJSON().role.name) : [];
};

module.exports = {
  findByEmail,
  rolesByUserId,
};
