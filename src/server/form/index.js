module.exports = {
  login: require('./login'),
  register: require('./register'),
  invited: require('./invited'),
  revision: require('./revision'),
  comment: require('./comment'),
  admin: {
    userGroupCreate: require('./admin/userGroupCreate'),
  },
};
