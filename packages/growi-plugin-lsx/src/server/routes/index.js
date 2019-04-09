module.exports = (crowi, app) => {
  const lsx = require('./lsx')(crowi, app);
  // const middleware = crowi.require('../util/middlewares');
  // const debug = require('debug')('growi-plugin:lsx:routes');
  // const loginRequired = middleware.loginRequired;
  // const accessTokenParser = middleware.accessTokenParser(crowi, app);
  // const csrf = middleware.csrfVerify(crowi, app);

  // app.get('/_api/plugins/lsx', accessTokenParser , loginRequired(crowi, app) , lsx.renderHtml);
  app.get('/_api/plugins/lsx', lsx.listPages);
};
