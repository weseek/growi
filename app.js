/**
 * Fakie::app.js
 *
 * @package Fakie
 * @author  Sotaro KARASAWA <sotarok@crocos.co.jp>
 */

var express  = require('express');
var cons     = require('consolidate');
var swig     = require('swig');
var flash    = require('connect-flash');
var config   = require('config');
var http     = require('http');
var facebook = require('facebook-node-sdk');
var mongo    = require('mongoose');
var socketio = require('socket.io');

var time     = require('time');
time.tzset('Asia/Tokyo');
tzoffset = -(config.app.timezone || 9) * 60; // for datez

var app = express();

mongo.connect('mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.host + '/' + config.mongodb.dbname);


// swig
// TODO どっかに移す
swig.setFilter('path2name', function(string) {
  return string.replace(/.+\/(.+)?$/, "$1");
});
swig.setFilter('datetz', function(input, format) {
  // デフォルトの filter の override するにはどうしたらいいんだろうかね
  var swigFilters     = require('swig/lib/filters')
  return swigFilters.date(input, format, tzoffset);
});
swig.setFilter('presentation', function(string) {
  // 手抜き
  return string.replace(/[\n]+#/g, "\n\n\n#");
});
swig.setFilter('picture', function(user) {
  if (!user) {
    return '';
  }

  user.fbId = user.userId; // migration
  if (user.image && user.image != '/images/userpicture.png') {
    return user.image;
  } else if (user.fbId) {
    return '//graph.facebook.com/' + user.fbId + '/picture?size=square';
  } else {
    return '/images/userpicture.png';
  }
});

app.configure(function(){
  var models;

  app.set('port', config.server.port || 3000);
  app.engine('html', cons.swig);
  app.set('view cache', false);
  app.set('view engine', 'html');
  app.set('views', __dirname + '/views');
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    rolling: true,
    secret: config.session.secret,
  }));
  app.use(flash());
  app.use(facebook.middleware({appId: config.facebook.appId, secret: config.facebook.secret}));
  models = require('./models')(app);
  app.use(function(req, res, next) {
    var days = (1000*3600*24*30);
    req.session.cookie.expires = new Date(Date.now() + days);
    req.session.cookie.maxAge = days;

    var now = new Date();

    req.config = config;
    req.baseUrl = (req.headers['x-forwarded-proto'] == 'https' ? 'https' : req.protocol) + "://" + req.get('host');
    res.locals({
      req: req,
      baseUrl: req.baseUrl,
      config: config,
      env: app.get('env'),
      now: now,
      tzoffset: tzoffset,
      facebook: {appId: config.facebook.appId},
      consts: {
        pageGrants: models.Page.getGrantLabels(),
        userStatus: models.User.getUserStatusLabels(),
      },
    });
    next();
  });

  // register swig function
  app.use(function(req, res, next) {
    res.locals(require('./lib/swig_functions')(app));
    next();
  });

  app.use(function(req, res, next) {
    // session に user object が入ってる
    if (req.session.user && '_id' in req.session.user) {
      models.User.findById(req.session.user._id, function(err, userData) {
        if (err) {
          next()
        } else {
          req.user = req.session.user = userData;
          res.locals({user: req.user});
          next();
        }
      });
    } else {
      req.user = req.session.user = false;
      res.locals({user: req.user});
      next();
    }
  });

  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  swig.setDefaults({ cache: false });
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});

app.configure('production', function(){
  var oneYear = 31557600000;

  // Error Handler
  app.use(function (err, req, res, next) {
    res.status(500);
    res.render('500', { error: err });
  });
});

var server = 1;
if (app.get('env') == 'development') {
  server = http.createServer(app).listen(app.get('port'), function(){
    console.log("[" + app.get('env') + "] Express server listening on port " + app.get('port'));
  });
} else {
  server = http.createServer(app).listen(app.get('port'), '127.0.0.1', function(){
    console.log("[" + app.get('env') + "] Express server listening on port " + app.get('port'));
  });
}

var io = socketio.listen(server);
io.sockets.on('connection', function (socket) {
});

app.set('io', io);
require('./routes')(app);
