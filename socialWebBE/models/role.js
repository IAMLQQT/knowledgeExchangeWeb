const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('role', {
    RoleID: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    RoleName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Detail: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'role',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RoleID" },
        ]
      },
      {
        name: "RoleID_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RoleID" },
        ]
      },
    ]
  });
};
