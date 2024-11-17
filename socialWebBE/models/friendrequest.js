const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('friendrequest', {
    request_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_sent_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    user_receive_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    request_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'friendrequest',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "request_id" },
          { name: "user_sent_id" },
          { name: "user_receive_id" },
        ]
      },
      {
        name: "request_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "request_id" },
        ]
      },
      {
        name: "fk_friendrequest_user1_idx",
        using: "BTREE",
        fields: [
          { name: "user_sent_id" },
        ]
      },
      {
        name: "fk_friendrequest_user2_idx",
        using: "BTREE",
        fields: [
          { name: "user_receive_id" },
        ]
      },
    ]
  });
};
