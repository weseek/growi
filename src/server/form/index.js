module.exports = {
  login: require('./login'),
  register: require('./register'),
  invited: require('./invited'),
  revision: require('./revision'),
  comment: require('./comment'),
  me: {
    user: require('./me/user'),
    password: require('./me/password'),
    apiToken: require('./me/apiToken'),
  },
  admin: {
    securityGeneral: require('./admin/securityGeneral'),
    securityPassportLocal: require('./admin/securityPassportLocal'),
    securityPassportLdap: require('./admin/securityPassportLdap'),
    securityPassportSaml: require('./admin/securityPassportSaml'),
    securityPassportBasic: require('./admin/securityPassportBasic'),
    securityPassportGoogle: require('./admin/securityPassportGoogle'),
    securityPassportGitHub: require('./admin/securityPassportGitHub'),
    securityPassportTwitter: require('./admin/securityPassportTwitter'),
    securityPassportOidc: require('./admin/securityPassportOidc'),
    userGroupCreate: require('./admin/userGroupCreate'),
  },
};
