module.exports = (crowi) => {
  return {
    userGroup: require('./user-group')(crowi),
  };
};
