exports.login = require('./login');
exports.register = require('./register');
exports.revision = require('./revision');
exports.me = {
  user: require('./me/user'),
  password: require('./me/password')
};
