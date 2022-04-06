module.exports = {
  login: require('./login'),
  register: require('./register'),
  invited: require('./invited'),
  admin: {
    userGroupCreate: require('./admin/userGroupCreate'),
  },
};
