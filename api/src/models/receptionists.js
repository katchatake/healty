const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('receptionists', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "receptionists_ibfk_1"
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    assigned_to_professional_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'professionals',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'receptionists',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "assigned_to_professional_id",
        using: "BTREE",
        fields: [
          { name: "assigned_to_professional_id" },
        ]
      },
    ]
  });
};
