'use strict';

module.exports = function(crowi, app) {
  var express        = require('express')
    , bodyParser     = require('body-parser')
    , multer         = require('multer')
    , morgan         = require('morgan')
    , cookieParser   = require('cookie-parser')
    , methodOverride = require('method-override')
    , errorHandler   = require('errorhandler')
    , session        = require('express-session')
    , basicAuth      = require('basic-auth-connect')
    , flash          = require('connect-flash')
    , cons           = require('consolidate')
    , swig           = require('swig')
    , env            = crowi.node_env
    , middleware     = require('../util/middlewares')
    ;

  app.use(function(req, res, next) {
    var now = new Date()
      , fbparams = {}
      , baseUrl
      , config = crowi.getConfig()
      , tzoffset = -(config.crowi['app:timezone'] || 9) * 60 // for datez
      , Page = crowi.model('Page')
      , User = crowi.model('User')
      , Config = crowi.model('Config')
      ;

    app.set('tzoffset', tzoffset);

    req.config = config;

    config.crowi['app:url'] = baseUrl = (req.headers['x-forwarded-proto'] == 'https' ? 'https' : req.protocol) + '://' + req.get('host');

    res.locals.req      = req;
    res.locals.baseUrl  = baseUrl;
    res.locals.config   = config;
    res.locals.env      = env;
    res.locals.now      = now;
    res.locals.tzoffset = tzoffset;
    res.locals.facebook = {appId: config.crowi['facebook:appId'] || ''};
    res.locals.consts   = {
        pageGrants: Page.getGrantLabels(),
        userStatus: User.getUserStatusLabels(),
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

  // Register Facebook middleware
  app.use(function(req, res, next) {
    var config = crowi.getConfig()
      , facebook = require('facebook-node-sdk')
      ;

    if (config.crowi['facebook:appId'] && config.crowi['facebook:secret']) {
      return facebook.middleware({
        appId: config.crowi['facebook:appId'],
        secret: config.crowi['facebook:secret']
      })(req, res, next);
    } else {
      return next();
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
  app.use(multer());
  app.use(session(crowi.sessionConfig));
  app.use(flash());

  app.use(middleware.swigFilters(app, swig));
  app.use(middleware.swigFunctions(crowi, app));

  app.use(middleware.loginChecker(crowi, app));

  if (env == 'development') {
    swig.setDefaults({ cache: false });
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(morgan('dev'));
  }

  if (env == 'production') {
    var oneYear = 31557600000;
    app.use(morgan('combined'));
    app.use(function (err, req, res, next) {
      res.status(500);
      res.render('500', { error: err });
    });
  }
};
