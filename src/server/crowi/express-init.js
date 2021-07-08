import { nextI18NextMiddleware } from 'next-i18next/dist/commonjs/middlewares';

import nextI18next from '~/i18n';

import safeRedirectMiddleware from '../middlewares/safe-redirect';

module.exports = function(crowi, app) {
  const debug = require('debug')('growi:crowi:express-init');
  // const path = require('path');
  const express = require('express');
  const helmet = require('helmet');
  const cookieParser = require('cookie-parser');
  const methodOverride = require('method-override');
  const passport = require('passport');
  const expressSession = require('express-session');
  const flash = require('connect-flash');
  const mongoSanitize = require('express-mongo-sanitize');
  // const swig = require('swig-templates');
  // const webpackAssets = require('express-webpack-assets');

  const promster = require('../middlewares/promster')(crowi, app);
  const injectCurrentuserToLocalvars = require('../middlewares/inject-currentuser-to-localvars')();
  const autoReconnectToS2sMsgServer = require('../middlewares/auto-reconnect-to-s2s-msg-server')(crowi);

  const avoidSessionRoutes = require('../routes/avoid-session-routes');

  // const env = crowi.node_env;

  app.use(helmet());

  // app.use((req, res, next) => {
  //   const now = new Date();
  //   // for datez

  //   const Page = crowi.model('Page');
  //   app.set('tzoffset', crowi.appService.getTzoffset());

  //   req.csrfToken = null;

  //   res.locals.req = req;
  //   res.locals.baseUrl = crowi.appService.getSiteUrl();
  //   res.locals.env = env;
  //   res.locals.now = now;
  //   res.locals.consts = {
  //     pageGrants: Page.getGrantLabels(),
  //   };
  //   res.locals.local_config = Config.getLocalconfig(); // config for browser context

  //   next();
  // });

  app.set('port', crowi.port);
  const staticOption = (crowi.node_env === 'production') ? { maxAge: '30d' } : {};
  app.use(express.static(crowi.publicDir, staticOption));
  // app.engine('html', swig.renderFile);
  // app.use(webpackAssets(
  //   path.join(crowi.publicDir, 'manifest.json'),
  //   { devMode: (crowi.node_env === 'development') },
  // ));
  // app.set('view cache', false);  // Default: true in production, otherwise undefined. -- 2017.07.04 Yuki Takei
  // app.set('view engine', 'html');
  // app.set('views', crowi.viewsDir);
  app.use(methodOverride());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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

  // passport
  debug('initialize Passport');
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());
  app.use(mongoSanitize());

  app.use(promster);
  app.use(safeRedirectMiddleware.use);
  app.use(injectCurrentuserToLocalvars);
  app.use(autoReconnectToS2sMsgServer);

  // const middlewares = require('../util/middlewares')(crowi, app);
  // app.use(middlewares.swigFilters(swig));
  // app.use(middlewares.swigFunctions());
  // app.use(middlewares.csrfKeyGenerator());

  app.use(nextI18NextMiddleware(nextI18next));
};
