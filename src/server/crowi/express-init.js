

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:crowi:express-init');
  const path = require('path');
  const express = require('express');
  const helmet = require('helmet');
  const bodyParser = require('body-parser');
  const cookieParser = require('cookie-parser');
  const methodOverride = require('method-override');
  const passport = require('passport');
  const expressSession = require('express-session');
  const sanitizer = require('express-sanitizer');
  const flash = require('connect-flash');
  const swig = require('swig-templates');
  const webpackAssets = require('express-webpack-assets');
  const i18next = require('i18next');
  const i18nFsBackend = require('i18next-node-fs-backend');
  const i18nSprintf = require('i18next-sprintf-postprocessor');
  const i18nMiddleware = require('i18next-express-middleware');

  const avoidSessionRoutes = require('../routes/avoid-session-routes');
  const i18nUserSettingDetector = require('../util/i18nUserSettingDetector');

  const env = crowi.node_env;

  // New type config API
  const configManager = crowi.configManager;
  const getConfig = configManager.getConfig;

  const User = crowi.model('User');
  const lngDetector = new i18nMiddleware.LanguageDetector();
  lngDetector.addDetector(i18nUserSettingDetector);

  i18next
    .use(lngDetector)
    .use(i18nFsBackend)
    .use(i18nSprintf)
    .init({
      // debug: true,
      fallbackLng: [User.LANG_EN_US],
      whitelist: Object.keys(User.getLanguageLabels()).map((k) => { return User[k] }),
      backend: {
        loadPath: `${crowi.localeDir}{{lng}}/translation.json`,
      },
      detection: {
        order: ['userSettingDetector', 'header', 'navigator'],
      },
      overloadTranslationOptionHandler: i18nSprintf.overloadTranslationOptionHandler,

      // change nsSeparator from ':' to '::' because ':' is used in config keys and these are used in i18n keys
      nsSeparator: '::',
    });

  app.use(helmet());

  app.use((req, res, next) => {
    const now = new Date();
    const tzoffset = -(getConfig('crowi', 'app:timezone') || 9) * 60;
    // for datez

    const Page = crowi.model('Page');
    const User = crowi.model('User');
    const Config = crowi.model('Config');
    app.set('tzoffset', tzoffset);

    req.csrfToken = null;

    res.locals.req = req;
    res.locals.baseUrl = crowi.appService.getSiteUrl();
    res.locals.env = env;
    res.locals.now = now;
    res.locals.tzoffset = tzoffset;
    res.locals.consts = {
      pageGrants: Page.getGrantLabels(),
      userStatus: User.getUserStatusLabels(),
      language:   User.getLanguageLabels(),
      restrictGuestMode: crowi.aclService.getRestrictGuestModeLabels(),
      registrationMode: crowi.aclService.getRegistrationModeLabels(),
    };
    res.locals.local_config = Config.getLocalconfig(); // config for browser context

    next();
  });

  app.set('port', crowi.port);
  const staticOption = (crowi.node_env === 'production') ? { maxAge: '30d' } : {};
  app.use(express.static(crowi.publicDir, staticOption));
  app.engine('html', swig.renderFile);
  app.use(webpackAssets(
    path.join(crowi.publicDir, 'manifest.json'),
    { devMode: (crowi.node_env === 'development') },
  ));
  // app.set('view cache', false);  // Default: true in production, otherwise undefined. -- 2017.07.04 Yuki Takei
  app.set('view engine', 'html');
  app.set('views', crowi.viewsDir);
  app.use(methodOverride());
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(sanitizer());
  app.use(cookieParser());

  // configure express-session
  app.use((req, res, next) => {
    // test whether the route is listed in avoidSessionTroutes
    for (const regex of avoidSessionRoutes) {
      if (regex.test(req.path)) {
        return next();
      }
    }

    expressSession(crowi.sessionConfig)(req, res, next);
  });

  // Set basic auth middleware
  app.use((req, res, next) => {
    if (req.query.access_token || req.body.access_token) {
      return next();
    }

    // FIXME:
    //   healthcheck endpoint exclude from basic authentication.
    //   however, hard coding is not desirable.
    //   need refactoring (ex. setting basic authentication for each routes)
    if (req.path === '/_api/v3/healthcheck') {
      return next();
    }

    next();
  });

  // passport
  debug('initialize Passport');
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());

  const middlewares = require('../util/middlewares')(crowi, app);

  app.use(middlewares.swigFilters(swig));
  app.use(middlewares.swigFunctions());

  app.use(middlewares.csrfKeyGenerator());

  app.use(middlewares.loginCheckerForPassport);

  app.use(i18nMiddleware.handle(i18next));
};
