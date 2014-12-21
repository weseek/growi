exports.login = require('./login');
exports.register = require('./register');
exports.invited = require('./invited');
exports.revision = require('./revision');
exports.me = {
  user: require('./me/user'),
  password: require('./me/password')
};
exports.admin = {
  app: require('./admin/app'),
  sec: require('./admin/sec'),
  mail: require('./admin/mail'),
  aws: require('./admin/aws'),
  google: require('./admin/google'),
  fb: require('./admin/fb'),
  userInvite: require('./admin/userInvite'),
};
