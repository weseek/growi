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
    userGroupCreate: require('./admin/userGroupCreate'),
  },
};
