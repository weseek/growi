const debug = require('debug')('growi:lib:middlewares');
const logger = require('@alias/logger')('growi:lib:middlewares');
const md5 = require('md5');
const entities = require('entities');

exports.csrfKeyGenerator = function(crowi, app) {
  return function(req, res, next) {
    var csrfKey = (req.session && req.session.id) || 'anon';

    if (req.csrfToken === null) {
      req.csrfToken = crowi.getTokens().create(csrfKey);
    }

    next();
  };
};

exports.loginChecker = function(crowi, app) {
  return function(req, res, next) {
    var User = crowi.model('User');

    // session に user object が入ってる
    if (req.session.user && '_id' in req.session.user) {
      User.findById(req.session.user._id, function(err, userData) {
        if (err) {
          next();
        }
        else {
          req.user = req.session.user = userData;
          res.locals.user = req.user;
          next();
        }
      });
    }
    else {
      req.user = req.session.user = null;
      res.locals.user = req.user;
      next();
    }
  };
};

exports.loginCheckerForPassport = function(crowi, app) {
  return function(req, res, next) {
    res.locals.user = req.user;
    next();
  };
};

exports.csrfVerify = function(crowi, app) {
  return function(req, res, next) {
    var token = req.body._csrf || req.query._csrf || null;
    var csrfKey = (req.session && req.session.id) || 'anon';

    debug('req.skipCsrfVerify', req.skipCsrfVerify);
    if (req.skipCsrfVerify) {
      debug('csrf verify skipped');
      return next();
    }

    if (crowi.getTokens().verify(csrfKey, token)) {
      debug('csrf successfully verified');
      return next();
    }

    logger.warn('csrf verification failed. return 403', csrfKey, token);
    return res.sendStatus(403);
  };
};

exports.swigFunctions = function(crowi, app) {
  return function(req, res, next) {
    require('../util/swigFunctions')(crowi, app, req, res.locals);
    next();
  };
};

exports.swigFilters = function(crowi, app, swig) {

  // define a function for Gravatar
  const generateGravatarSrc = function(user) {
    const email = user.email || '';
    const hash = md5(email.trim().toLowerCase());
    return `https://gravatar.com/avatar/${hash}`;
  };

  // define a function for uploaded picture
  const getUploadedPictureSrc = function(user) {
    if (user.image) {
      return user.image;
    }
    else {
      return '/images/icons/user.svg';
    }
  };


  return function(req, res, next) {
    swig.setFilter('path2name', function(string) {
      var name = string.replace(/(\/)$/, '');

      if (name.match(/.+\/([^/]+\/\d{4}\/\d{2}\/\d{2})$/)) { // /.../hoge/YYYY/MM/DD 形式のページ
        return name.replace(/.+\/([^/]+\/\d{4}\/\d{2}\/\d{2})$/, '$1');
      }
      if (name.match(/.+\/([^/]+\/\d{4}\/\d{2})$/)) { // /.../hoge/YYYY/MM 形式のページ
        return name.replace(/.+\/([^/]+\/\d{4}\/\d{2})$/, '$1');
      }
      if (name.match(/.+\/([^/]+\/\d{4})$/)) { // /.../hoge/YYYY 形式のページ
        return name.replace(/.+\/([^/]+\/\d{4})$/, '$1');
      }

      return name.replace(/.+\/(.+)?$/, '$1'); // ページの末尾を拾う
    });

    swig.setFilter('normalizeDateInPath', function(path) {
      var patterns = [
        [/20(\d{2})(\d{2})(\d{2})(.+)/g, '20$1/$2/$3/$4'],
        [/20(\d{2})(\d{2})(\d{2})/g, '20$1/$2/$3'],
        [/20(\d{2})(\d{2})(.+)/g, '20$1/$2/$3'],
        [/20(\d{2})(\d{2})/g, '20$1/$2'],
        [/20(\d{2})_(\d{1,2})_(\d{1,2})_?(.+)/g, '20$1/$2/$3/$4'],
        [/20(\d{2})_(\d{1,2})_(\d{1,2})/g, '20$1/$2/$3'],
        [/20(\d{2})_(\d{1,2})_?(.+)/g, '20$1/$2/$3'],
        [/20(\d{2})_(\d{1,2})/g, '20$1/$2'],
      ];

      for (var i = 0; i < patterns.length ; i++) {
        var mat = patterns[i][0];
        var rep = patterns[i][1];
        if (path.match(mat)) {
          return path.replace(mat, rep);
        }
      }

      return path;
    });

    swig.setFilter('datetz', function(input, format) {
      // timezone
      const swigFilters = require('swig-templates/lib/filters');
      return swigFilters.date(input, format, app.get('tzoffset'));
    });

    swig.setFilter('nl2br', function(string) {
      return string
        .replace(/\n/g, '<br>');
    });

    swig.setFilter('removeLastSlash', function(string) {
      if (string == '/') {
        return string;
      }

      return string.substr(0, string.length - 1);
    });

    swig.setFilter('presentation', function(string) {
      // 手抜き
      return string
        .replace(/[\n]+#/g, '\n\n\n#')
        .replace(/\s(https?.+(jpe?g|png|gif))\s/, '\n\n\n![]($1)\n\n\n');
    });

    swig.setFilter('gravatar', generateGravatarSrc);
    swig.setFilter('uploadedpicture', getUploadedPictureSrc);

    swig.setFilter('picture', function(user) {
      if (!user) {
        return '/images/icons/user.svg';
      }

      if (user.isGravatarEnabled === true) {
        return generateGravatarSrc(user);
      }
      else {
        return getUploadedPictureSrc(user);
      }
    });

    swig.setFilter('encodeHTML', function(string) {
      return entities.encodeHTML(string);
    });

    swig.setFilter('preventXss', function(string) {
      return crowi.xss.process(string);
    });

    next();
  };
};

exports.adminRequired = function() {
  return function(req, res, next) {
    // check the user logged in
    //  make sure that req.user isn't username/email string to login which is set by basic-auth-connect
    if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
      if (req.user.admin) {
        next();
        return;
      }
      return res.redirect('/');
    }
    return res.redirect('/login');
  };
};

/**
 * require login handler
 *
 * @param {any} crowi
 * @param {any} app
 * @param {boolean} isStrictly whethere strictly restricted (default true)
 */
exports.loginRequired = function(crowi, app, isStrictly = true) {
  return function(req, res, next) {
    var User = crowi.model('User');

    // when the route is not strictly restricted
    if (!isStrictly) {
      var config = req.config;
      var Config = crowi.model('Config');

      // when allowed to read
      if (Config.isGuestAllowedToRead(config)) {
        return next();
      }
    }

    // check the user logged in
    //  make sure that req.user isn't username/email string to login which is set by basic-auth-connect
    if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
      if (req.user.status === User.STATUS_ACTIVE) {
        // Active の人だけ先に進める
        return next();
      }
      else if (req.user.status === User.STATUS_REGISTERED) {
        return res.redirect('/login/error/registered');
      }
      else if (req.user.status === User.STATUS_SUSPENDED) {
        return res.redirect('/login/error/suspended');
      }
      else if (req.user.status === User.STATUS_INVITED) {
        return res.redirect('/login/invited');
      }
    }

    // is api path
    var path = req.path || '';
    if (path.match(/^\/_api\/.+$/)) {
      return res.sendStatus(403);
    }

    req.session.jumpTo = req.originalUrl;
    return res.redirect('/login');
  };
};

exports.accessTokenParser = function(crowi, app) {
  return function(req, res, next) {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    var accessToken = req.query.access_token || req.body.access_token || null;
    if (!accessToken) {
      return next();
    }

    var User = crowi.model('User');

    debug('accessToken is', accessToken);
    User.findUserByApiToken(accessToken)
    .then(function(userData) {
      req.user = userData;
      req.skipCsrfVerify = true;
      debug('Access token parsed: skipCsrfVerify');

      next();
    }).catch(function(err) {
      next();
    });
  };
};

// this is for Installer
exports.applicationNotInstalled = function() {
  return function(req, res, next) {
    var config = req.config;

    if (Object.keys(config.crowi).length !== 1) {
      req.flash('errorMessage', 'Application already installed.');
      return res.redirect('admin'); // admin以外はadminRequiredで'/'にリダイレクトされる
    }

    return next();
  };
};

exports.checkSearchIndicesGenerated = function(crowi, app) {
  return function(req, res, next) {
    const searcher = crowi.getSearcher();

    // build index
    if (searcher) {
      searcher.buildIndex()
        .then((data) => {
          if (!data.errors) {
            debug('Index created.');
          }
          return searcher.addAllPages();
        })
        .catch((error) => {
          if (error.message != null && error.message.match(/index_already_exists_exception/)) {
            debug('Creating index is failed: ', error.message);
          }
          else {
            console.log(`Error while building index of Elasticsearch': ${error.message}`);
          }
        });
    }

    return next();
  };
};

exports.applicationInstalled = function() {
  return function(req, res, next) {
    var config = req.config;

    if (Object.keys(config.crowi).length === 1) { // app:url is set by process
      return res.redirect('/installer');
    }

    return next();
  };
};

exports.awsEnabled = function() {
  return function(req, res, next) {
    var config = req.config;
    if (config.crowi['aws:region'] !== '' && config.crowi['aws:bucket'] !== '' && config.crowi['aws:accessKeyId'] !== '' && config.crowi['aws:secretAccessKey'] !== '') {
      req.flash('globalError', 'AWS settings required to use this function. Please ask the administrator.');
      return res.redirect('/');
    }

    return next();
  };
};
