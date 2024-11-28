const { Sequelize } = require('sequelize');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const initModel = require('./init-models');

const databaseName = process.env.DATABASE_NAME;

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const PORT = process.env.DATABASE_PORT || 3306;
const sequelize = new Sequelize(databaseName, "root", password, {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: PORT,
    password: password,
    define: {
        timestamps: false,
    },
});
//Define model
const { user, account, role, friendship, friendrequest, bookmark, likes, posts, tags, tags_posts, report_post, forum } = initModel(sequelize);
sequelize.addHook('beforeCount', function (options) {
    if (this._scope.include && this._scope.include.length > 0) {
        options.distinct = true;
        options.col =
            this._scope.col || options.col || `"${this.options.name.singular}".id`;
    }

    if (options.include && options.include.length > 0) {
        options.include = null;
    }
});
//Define relationship
// sequelize.addHook('beforeCount', function (options) {
//     if (this._scope.include && this._scope.include.length > 0) {
//         options.distinct = true;
//         options.col =
//             this._scope.col || options.col || `"${this.options.name.singular}".id`;
//     }

//     if (options.include && options.include.length > 0) {
//         options.include = null;
//     }
// });
account.addHook('beforeCreate', async (account) => {
    if (account.password) {
        account.password = await bcrypt.hash(account.password, 12);
        account.passwordChangeAt = Date.now();
    }
});
account.addHook('beforeUpdate', async (account) => {
    if (account.changed('password')) {
        account.password = await bcrypt.hash(account.password, 12);
        account.passwordChangeAt = Date.now();
    }
});

account.prototype.checkPassword = async (candidatePassword, userPassword) =>
    await bcrypt.compare(candidatePassword, userPassword);
account.prototype.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.passwordResetExpries = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
};
account.removeAttribute('id');
posts.removeAttribute('id');

module.exports = {
    sequelize,
    user, 
    account, 
    role, 
    friendship, 
    friendrequest, 
    bookmark, 
    likes, 
    posts, 
    tags, 
    tags_posts,
    report_post,
    forum
};