module.exports = function(crowi, app) {
  const actions = {};

  actions.forgotpassword = async function(req, res) {
    return res.render('forgot-password');
  };

  return actions;
};
