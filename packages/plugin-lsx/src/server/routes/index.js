
const loginRequiredFallback = (req, res) => {
  return res.status(403).send('login required');
};

module.exports = (crowi, app) => {
  const lsx = require('./lsx')(crowi, app);

  const loginRequired = crowi.require('../middlewares/login-required')(crowi, true, loginRequiredFallback);
  const accessTokenParser = crowi.require('../middlewares/access-token-parser')(crowi);

  app.get('/_api/plugins/lsx', accessTokenParser, loginRequired, lsx.listPages);
};
