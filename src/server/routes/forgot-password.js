module.exports = function(crowi, app) {
  const actions = {};

  actions.forgotPassword = async function(req, res) {
    return res.render('forgot-password');
  };

  return actions;
};
