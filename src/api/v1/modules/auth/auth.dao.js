const { models } = require('../../../../config/database');

const findByEmail = async (email) => {
  return await models.User.findOne({
    where: { email },
    include: [{
      model: models.Role,
      as: 'roles',
      attributes: ['name'],
      through: { attributes: [] }
    }]
  });
};

module.exports = {
  findByEmail,
};
