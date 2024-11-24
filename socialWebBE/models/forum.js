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
    forum_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
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
    ]
  });
};
