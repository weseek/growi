
const loginRequiredFallback = (req, res) => {
  return res.status(403).send('login required');
};

module.exports = (crowi, app) => {
  const database = require('./database')(crowi, app);

  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  app.get('/_api/plugins/database', accessTokenParser, loginRequired, database.getDatabase);
};
