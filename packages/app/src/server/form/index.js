module.exports = {
  login: require('./login'),
  register: require('./register'),
  registerUserActivation: require('./registerUserActivation'),
  invited: require('./invited'),
  admin: {
    userGroupCreate: require('./admin/userGroupCreate'),
  },
};
