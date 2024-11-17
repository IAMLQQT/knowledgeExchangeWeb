var DataTypes = require("sequelize").DataTypes;
var _account = require("./account");
var _bookmark = require("./bookmark");
var _comments = require("./comments");
var _friendrequest = require("./friendrequest");
var _friendship = require("./friendship");
var _likes = require("./likes");
var _posts = require("./posts");
var _report_post = require("./report_post");
var _role = require("./role");
var _tags = require("./tags");
var _tags_posts = require("./tags_posts");
var _user = require("./user");

function initModels(sequelize) {
  var account = _account(sequelize, DataTypes);
  var bookmark = _bookmark(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var friendrequest = _friendrequest(sequelize, DataTypes);
  var friendship = _friendship(sequelize, DataTypes);
  var likes = _likes(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var report_post = _report_post(sequelize, DataTypes);
  var role = _role(sequelize, DataTypes);
  var tags = _tags(sequelize, DataTypes);
  var tags_posts = _tags_posts(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  posts.belongsToMany(tags, { as: 'tag_id_tags', through: tags_posts, foreignKey: "post_id", otherKey: "tag_id" });
  posts.belongsToMany(user, { as: 'user_id_users', through: bookmark, foreignKey: "post_id", otherKey: "user_id" });
  posts.belongsToMany(user, { as: 'user_id_user_comments', through: comments, foreignKey: "post_id", otherKey: "user_id" });
  posts.belongsToMany(user, { as: 'user_id_user_likes', through: likes, foreignKey: "post_id", otherKey: "user_id" });
  posts.belongsToMany(user, { as: 'user_id_user_report_posts', through: report_post, foreignKey: "post_id", otherKey: "user_id" });
  tags.belongsToMany(posts, { as: 'post_id_posts_tags_posts', through: tags_posts, foreignKey: "tag_id", otherKey: "post_id" });
  user.belongsToMany(posts, { as: 'post_id_posts', through: bookmark, foreignKey: "user_id", otherKey: "post_id" });
  user.belongsToMany(posts, { as: 'post_id_posts_comments', through: comments, foreignKey: "user_id", otherKey: "post_id" });
  user.belongsToMany(posts, { as: 'post_id_posts_likes', through: likes, foreignKey: "user_id", otherKey: "post_id" });
  user.belongsToMany(posts, { as: 'post_id_posts_report_posts', through: report_post, foreignKey: "user_id", otherKey: "post_id" });
  user.belongsToMany(user, { as: 'user_receive_id_users', through: friendrequest, foreignKey: "user_sent_id", otherKey: "user_receive_id" });
  user.belongsToMany(user, { as: 'user_sent_id_users', through: friendrequest, foreignKey: "user_receive_id", otherKey: "user_sent_id" });
  user.belongsToMany(user, { as: 'user_friend_id_users', through: friendship, foreignKey: "user_id", otherKey: "user_friend_id" });
  user.belongsToMany(user, { as: 'user_id_user_friendships', through: friendship, foreignKey: "user_friend_id", otherKey: "user_id" });
  user.belongsTo(account, { as: "account", foreignKey: "accountID" });
  account.hasMany(user, { as: "users", foreignKey: "accountID" });
  bookmark.belongsTo(posts, { as: "post", foreignKey: "post_id" });
  posts.hasMany(bookmark, { as: "bookmarks", foreignKey: "post_id" });
  comments.belongsTo(posts, { as: "post", foreignKey: "post_id" });
  posts.hasMany(comments, { as: "comments", foreignKey: "post_id" });
  likes.belongsTo(posts, { as: "post", foreignKey: "post_id" });
  posts.hasMany(likes, { as: "likes", foreignKey: "post_id" });
  report_post.belongsTo(posts, { as: "post", foreignKey: "post_id" });
  posts.hasMany(report_post, { as: "report_posts", foreignKey: "post_id" });
  tags_posts.belongsTo(posts, { as: "post", foreignKey: "post_id" });
  posts.hasMany(tags_posts, { as: "tags_posts", foreignKey: "post_id" });
  account.belongsTo(role, { as: "Role", foreignKey: "RoleID" });
  role.hasMany(account, { as: "accounts", foreignKey: "RoleID" });
  tags_posts.belongsTo(tags, { as: "tag", foreignKey: "tag_id" });
  tags.hasMany(tags_posts, { as: "tags_posts", foreignKey: "tag_id" });
  bookmark.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(bookmark, { as: "bookmarks", foreignKey: "user_id" });
  comments.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(comments, { as: "comments", foreignKey: "user_id" });
  friendrequest.belongsTo(user, { as: "user_sent", foreignKey: "user_sent_id" });
  user.hasMany(friendrequest, { as: "friendrequests", foreignKey: "user_sent_id" });
  friendrequest.belongsTo(user, { as: "user_receive", foreignKey: "user_receive_id" });
  user.hasMany(friendrequest, { as: "user_receive_friendrequests", foreignKey: "user_receive_id" });
  friendship.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(friendship, { as: "friendships", foreignKey: "user_id" });
  friendship.belongsTo(user, { as: "user_friend", foreignKey: "user_friend_id" });
  user.hasMany(friendship, { as: "user_friend_friendships", foreignKey: "user_friend_id" });
  likes.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(likes, { as: "likes", foreignKey: "user_id" });
  posts.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(posts, { as: "posts", foreignKey: "user_id" });
  report_post.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(report_post, { as: "report_posts", foreignKey: "user_id" });
  posts.hasMany(posts, {
    as: 'commentPost', // Tên của mối quan hệ
    foreignKey: 'original_post_id', // Cột dùng để tham chiếu
    sourceKey: 'post_id', // Cột nguồn
  });

  posts.belongsTo(posts, {
    as: 'parentPost', // Tên mối quan hệ ngược
    foreignKey: 'original_post_id', // Cột dùng để tham chiếu
    targetKey: 'post_id', // Cột đích
  });
  return {
    account,
    bookmark,
    comments,
    friendrequest,
    friendship,
    likes,
    posts,
    report_post,
    role,
    tags,
    tags_posts,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
