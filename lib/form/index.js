var validator = require('./validator');

exports.login = require('./login');
exports.register = require('./register');
exports.invited = require('./invited');
exports.revision = require('./revision');
exports.comment = require('./comment');
exports.me = {
  user: require('./me/user'),
  password: require('./me/password'),
  apiToken: require('./me/apiToken'),
};
exports.admin = {
  app: require('./admin/app'),
  sec: require('./admin/sec'),
  mail: require('./admin/mail'),
  aws: require('./admin/aws'),
  google: require('./admin/google'),
  userInvite: require('./admin/userInvite'),
  slackSetting: require('./admin/slackSetting'),
};
