'use strict';

module.exports = function(crowi, app) {
  var debug = require('debug')('crowi:crowi:express-init')
    , express        = require('express')
    , bodyParser     = require('body-parser')
    , cookieParser   = require('cookie-parser')
    , methodOverride = require('method-override')
    , session        = require('express-session')
    , basicAuth      = require('basic-auth-connect')
    , flash          = require('connect-flash')
    , cons           = require('consolidate')
    , swig           = require('swig')
    , i18next        = require('i18next')
    , i18nFsBackend  = require('i18next-node-fs-backend')
    , i18nSprintf    = require('i18next-sprintf-postprocessor')
    , i18nMiddleware = require('i18next-express-middleware')
    , i18nUserSettingDetector  = require('../util/i18nUserSettingDetector')
    , env            = crowi.node_env
    , middleware     = require('../util/middlewares')

    , User = crowi.model('User')
    ;

  var lngDetector = new i18nMiddleware.LanguageDetector();
  lngDetector.addDetector(i18nUserSettingDetector);

  i18next
    .use(lngDetector)
    .use(i18nFsBackend)
    .use(i18nSprintf)
    .init({
      debug: (crowi.node_env === 'development'),
      fallbackLng: [User.LANG_EN_US],
      whitelist: Object.keys(User.getLanguageLabels()).map((k) => User[k]),
      backend: {
        loadPath: 'locales/{{lng}}/translation.json'
      },
      detection: {
        order: ['userSettingDetector', 'header', 'navigator'],
      },
      overloadTranslationOptionHandler: i18nSprintf.overloadTranslationOptionHandler
    });

  app.use(function(req, res, next) {
    var now = new Date()
      , baseUrl
      , config = crowi.getConfig()
      , tzoffset = -(config.crowi['app:timezone'] || 9) * 60 // for datez
      , Page = crowi.model('Page')
      , User = crowi.model('User')
      , Config = crowi.model('Config')
      ;

    app.set('tzoffset', tzoffset);

    req.config = config;
    req.csrfToken = null;

    config.crowi['app:url'] = baseUrl = (req.headers['x-forwarded-proto'] == 'https' ? 'https' : req.protocol) + '://' + req.get('host');

    res.locals.req      = req;
    res.locals.baseUrl  = baseUrl;
    res.locals.config   = config;
    res.locals.env      = env;
    res.locals.now      = now;
    res.locals.tzoffset = tzoffset;
    res.locals.consts   = {
        pageGrants: Page.getGrantLabels(),
        userStatus: User.getUserStatusLabels(),
        language:   User.getLanguageLabels(),
        registrationMode: Config.getRegistrationModeLabels(),
    };

    next();
  });

  // Set basic auth middleware
  app.use(function(req, res, next) {
    var config = crowi.getConfig();

    if (config.crowi['security:basicName'] && config.crowi['security:basicSecret']) {
      return basicAuth(
        config.crowi['security:basicName'],
        config.crowi['security:basicSecret'])(req, res, next);
    } else {
      next();
    }
  });

  app.set('port', crowi.port);
  app.use(express.static(crowi.publicDir));
  app.engine('html', cons.swig);
  app.set('view cache', false);
  app.set('view engine', 'html');
  app.set('views', crowi.viewsDir);
  app.use(methodOverride());
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(cookieParser());
  app.use(session(crowi.sessionConfig));
  app.use(flash());

  app.use(middleware.swigFilters(app, swig));
  app.use(middleware.swigFunctions(crowi, app));

  app.use(middleware.loginChecker(crowi, app));

  app.use(i18nMiddleware.handle(i18next));
};
