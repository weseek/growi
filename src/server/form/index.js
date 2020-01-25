module.exports = {
  login: require('./login'),
  register: require('./register'),
  invited: require('./invited'),
  revision: require('./revision'),
  comment: require('./comment'),
  me: {
    user: require('./me/user'),
    password: require('./me/password'),
    imagetype: require('./me/imagetype'),
    apiToken: require('./me/apiToken'),
  },
  admin: {
    securityPassportGoogle: require('./admin/securityPassportGoogle'),
    securityPassportGitHub: require('./admin/securityPassportGitHub'),
    securityPassportTwitter: require('./admin/securityPassportTwitter'),
    slackIwhSetting: require('./admin/slackIwhSetting'),
    slackSetting: require('./admin/slackSetting'),
    userGroupCreate: require('./admin/userGroupCreate'),
    notificationGlobal: require('./admin/notificationGlobal'),
  },
};
