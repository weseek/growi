module.exports = (crowi, app) => {
  var debug = require('debug')('crowi-plugin:lsx:routes')
    , middleware = crowi.require('../util/middlewares')
    , lsx = require('./lsx')(crowi, app)
    , loginRequired = middleware.loginRequired
    , accessTokenParser = middleware.accessTokenParser(crowi, app)
    , csrf      = middleware.csrfVerify(crowi, app)
    ;

  app.get('/_api/plugins/lsx', accessTokenParser , loginRequired(crowi, app) , lsx.renderHtml);
}
