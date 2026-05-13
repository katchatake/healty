const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('professionals', {
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
      unique: "professionals_ibfk_1"
    },
    full_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    license_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: "license_number"
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'professionals',
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
        name: "license_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "license_number" },
        ]
      },
    ]
  });
};
