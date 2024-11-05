const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('account', {
    accountID: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email_UNIQUE"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passwordChangeAt: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    account_status: {
      type: DataTypes.ENUM('INACTIVE','ACTIVE','SUSPENDED','DELETED','LOCKED'),
      allowNull: false,
      defaultValue: "INACTIVE"
    },
    RoleID: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'role',
        key: 'RoleID'
      }
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passwordResetExpries: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    passwordVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    verificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    verificationExpires: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    suspendedUntil: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'account',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accountID" },
          { name: "RoleID" },
        ]
      },
      {
        name: "accountID_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accountID" },
        ]
      },
      {
        name: "email_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "fk_account_role1_idx",
        using: "BTREE",
        fields: [
          { name: "RoleID" },
        ]
      },
    ]
  });
};
