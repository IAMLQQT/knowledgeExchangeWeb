const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('forum', {
    forum_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true
    },
    forum_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    forum_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    post_count: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    forum_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      references: {
        model: 'user',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'forum',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "forum_id" },
        ]
      },
      {
        name: "fk_forum1_user1_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
