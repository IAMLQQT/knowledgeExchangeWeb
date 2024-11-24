const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('posts', {
    post_id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    post_status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    original_post_id: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    hiddenBy: {
      type: DataTypes.ENUM('user','admin'),
      allowNull: true
    },
    forum_id: {
      type: DataTypes.STRING(30),
      allowNull: true,
      references: {
        model: 'forum',
        key: 'forum_id'
      }
    }
  }, {
    sequelize,
    tableName: 'posts',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "post_id" },
          { name: "user_id" },
        ]
      },
      {
        name: "postID_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "post_id" },
        ]
      },
      {
        name: "fk_posts_user1_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "fk_posts_forums_idx",
        using: "BTREE",
        fields: [
          { name: "forum_id" },
        ]
      },
    ]
  });
};
