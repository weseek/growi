import csrf from 'csurf';
import mongoose from 'mongoose';

import { i18n, localePath } from '^/config/next-i18next.config';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:crowi:express-init');

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:crowi:express-init');
  const path = require('path');
  const express = require('express');
  const compression = require('compression');
  const helmet = require('helmet');
  const bodyParser = require('body-parser');
  const cookieParser = require('cookie-parser');
  const methodOverride = require('method-override');
  const passport = require('passport');
  const expressSession = require('express-session');
  const flash = require('connect-flash');
  const mongoSanitize = require('express-mongo-sanitize');
  const swig = require('swig-templates');
  const webpackAssets = require('express-webpack-assets');
  // const i18next = require('i18next');
  // const i18nFsBackend = require('i18next-node-fs-backend');
  // const i18nSprintf = require('i18next-sprintf-postprocessor');
  // const i18nMiddleware = require('i18next-express-middleware');

  const promster = require('../middlewares/promster')(crowi, app);
  const registerSafeRedirect = require('../middlewares/safe-redirect')();
  const injectCurrentuserToLocalvars = require('../middlewares/inject-currentuser-to-localvars')();
  const autoReconnectToS2sMsgServer = require('../middlewares/auto-reconnect-to-s2s-msg-server')(crowi);

  const avoidSessionRoutes = require('../routes/avoid-session-routes');
  // const i18nUserSettingDetector = require('../util/i18nUserSettingDetector');

  const env = crowi.node_env;

  // const lngDetector = new i18nMiddleware.LanguageDetector();
  // lngDetector.addDetector(i18nUserSettingDetector);

  // i18next
  //   .use(lngDetector)
  //   .use(i18nFsBackend)
  //   .use(i18nSprintf)
  //   .init({
  //     // debug: true,
  //     fallbackLng: ['en_US'],
  //     whitelist: i18n.locales,
  //     backend: {
  //       loadPath: `${localePath}/{{lng}}/translation.json`,
  //     },
  //     detection: {
  //       order: ['userSettingDetector', 'header', 'navigator'],
  //     },
  //     overloadTranslationOptionHandler: i18nSprintf.overloadTranslationOptionHandler,

  //     // change nsSeparator from ':' to '::' because ':' is used in config keys and these are used in i18n keys
  //     nsSeparator: '::',
  //   });

  app.use(compression());


  const { configManager } = crowi;

  const trustProxyBool = configManager.getConfig('crowi', 'security:trustProxyBool');
  const trustProxyCsv = configManager.getConfig('crowi', 'security:trustProxyCsv');
  const trustProxyHops = configManager.getConfig('crowi', 'security:trustProxyHops');

  const trustProxy = trustProxyBool ?? trustProxyCsv ?? trustProxyHops;

  try {
    if (trustProxy != null) {
      const isNotSpec = [trustProxyBool, trustProxyCsv, trustProxyHops].filter(trustProxy => trustProxy != null).length !== 1;
      if (isNotSpec) {
        // eslint-disable-next-line max-len
        logger.warn(`If more than one TRUST_PROXY_ ~ environment variable is set, the values are set in the following order of inequality size (BOOL > CSV > HOPS) first. Set value: ${trustProxy}`);
      }
      app.set('trust proxy', trustProxy);
    }
  }
  catch (err) {
    logger.error(err);
  }


  app.use(helmet({
    contentSecurityPolicy: false,
    expectCt: false,
    referrerPolicy: false,
    permittedCrossDomainPolicies: false,
  }));

  app.use((req, res, next) => {
    const now = new Date();
    // for datez

    const Page = crowi.model('Page');
    const User = crowi.model('User');
    const Config = mongoose.model('Config');
    app.set('tzoffset', crowi.appService.getTzoffset());

    res.locals.req = req;
    res.locals.baseUrl = crowi.appService.getSiteUrl();
    res.locals.env = env;
    res.locals.now = now;
    res.locals.local_config = Config.getLocalconfig(crowi); // config for browser context

    next();
  });

  app.set('port', crowi.port);
  const staticOption = (crowi.node_env === 'production') ? { maxAge: '30d' } : {};
  app.use(express.static(crowi.publicDir, staticOption));
  app.engine('html', swig.renderFile);
  // app.set('view cache', false);  // Default: true in production, otherwise undefined. -- 2017.07.04 Yuki Takei
  app.set('view engine', 'html');
  app.set('views', crowi.viewsDir);
  app.use(methodOverride());

  // inject rawBody to req
  app.use((req, res, next) => {
    if (!req.is('multipart/form-data')) {
      req.rawBody = '';
      req.on('data', (chunk) => {
        req.rawBody += chunk;
      });
    }

    next();
  });
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(cookieParser());

  // configure express-session
  const sessionMiddleware = expressSession(crowi.sessionConfig);
  app.use((req, res, next) => {
    // test whether the route is listed in avoidSessionRoutes
    for (const regex of avoidSessionRoutes) {
      if (regex.test(req.path)) {
        return next();
      }
    }

    sessionMiddleware(req, res, next);
  });

  // csurf should be initialized after express-session
  // default methods + PUT. See: https://expressjs.com/en/resources/middleware/csurf.html#ignoremethods
  app.use(csrf({ ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'DELETE'], cookie: false }));

  // passport
  debug('initialize Passport');
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
  app.use(mongoSanitize());

  app.use(promster);
  app.use(registerSafeRedirect);
  app.use(injectCurrentuserToLocalvars);
  app.use(autoReconnectToS2sMsgServer);

  const middlewares = require('../util/middlewares')(crowi, app);
  app.use(middlewares.swigFilters(swig));
  app.use(middlewares.swigFunctions());

  // app.use(i18nMiddleware.handle(i18next));
  // TODO: Remove this workaround implementation when i18n works correctly.
  //       For now, req.t returns string given to req.t(string)
  app.use((req, res, next) => {
    req.t = str => (typeof str === 'string' ? str : '');

    next();
  });
};
