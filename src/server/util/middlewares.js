// don't add any more middlewares to this file.
// all new middlewares should be an independent file under /server/routes/middlewares

const debug = require('debug')('growi:lib:middlewares');
const logger = require('@alias/logger')('growi:lib:middlewares');
const pathUtils = require('growi-commons').pathUtils;
const md5 = require('md5');
const entities = require('entities');

module.exports = (crowi) => {
  const { configManager, appService } = crowi;

  const middlewares = {};

  middlewares.csrfKeyGenerator = function() {
    return function(req, res, next) {
      const csrfKey = (req.session && req.session.id) || 'anon';

      if (req.csrfToken === null) {
        req.csrfToken = crowi.getTokens().create(csrfKey);
      }

      next();
    };
  };

  middlewares.loginCheckerForPassport = function(req, res, next) {
    res.locals.user = req.user;
    next();
  };

  middlewares.csrfVerify = function(req, res, next) {
    const token = req.body._csrf || req.query._csrf || null;
    const csrfKey = (req.session && req.session.id) || 'anon';

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

  middlewares.swigFunctions = function() {
    return function(req, res, next) {
      require('../util/swigFunctions')(crowi, req, res.locals);
      next();
    };
  };

  middlewares.swigFilters = function(swig) {
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
      if (user.imageAttachment != null) {
        return user.imageAttachment.filePathProxied;
      }

      return '/images/icons/user.svg';
    };


    return function(req, res, next) {
      swig.setFilter('path2name', (string) => {
        const name = string.replace(/(\/)$/, '');

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

      swig.setFilter('normalizeDateInPath', (path) => {
        const patterns = [
          [/20(\d{2})(\d{2})(\d{2})(.+)/g, '20$1/$2/$3/$4'],
          [/20(\d{2})(\d{2})(\d{2})/g, '20$1/$2/$3'],
          [/20(\d{2})(\d{2})(.+)/g, '20$1/$2/$3'],
          [/20(\d{2})(\d{2})/g, '20$1/$2'],
          [/20(\d{2})_(\d{1,2})_(\d{1,2})_?(.+)/g, '20$1/$2/$3/$4'],
          [/20(\d{2})_(\d{1,2})_(\d{1,2})/g, '20$1/$2/$3'],
          [/20(\d{2})_(\d{1,2})_?(.+)/g, '20$1/$2/$3'],
          [/20(\d{2})_(\d{1,2})/g, '20$1/$2'],
        ];

        for (let i = 0; i < patterns.length; i++) {
          const mat = patterns[i][0];
          const rep = patterns[i][1];
          if (path.match(mat)) {
            return path.replace(mat, rep);
          }
        }

        return path;
      });

      swig.setFilter('datetz', (input, format) => {
        // timezone
        const swigFilters = require('swig-templates/lib/filters');
        return swigFilters.date(input, format, crowi.appService.getTzoffset());
      });

      swig.setFilter('nl2br', (string) => {
        return string
          .replace(/\n/g, '<br>');
      });

      swig.setFilter('removeTrailingSlash', (string) => {
        return pathUtils.removeTrailingSlash(string);
      });

      swig.setFilter('addTrailingSlash', (string) => {
        return pathUtils.addTrailingSlash(string);
      });

      swig.setFilter('presentation', (string) => {
        // 手抜き
        return string
          .replace(/\s(https?.+(jpe?g|png|gif))\s/, '\n\n\n![]($1)\n\n\n');
      });

      swig.setFilter('gravatar', generateGravatarSrc);
      swig.setFilter('uploadedpicture', getUploadedPictureSrc);

      swig.setFilter('picture', (user) => {
        if (!user) {
          return '/images/icons/user.svg';
        }

        if (user.isGravatarEnabled === true) {
          return generateGravatarSrc(user);
        }

        return getUploadedPictureSrc(user);
      });

      swig.setFilter('encodeHTML', (string) => {
        return entities.encodeHTML(string);
      });

      swig.setFilter('preventXss', (string) => {
        return crowi.xss.process(string);
      });

      swig.setFilter('slice', (list, start, end) => {
        return list.slice(start, end);
      });

      next();
    };
  };

  middlewares.adminRequired = function(req, res, next) {
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

  /**
   * require login handler
   *
   * @param {boolean} isStrictly whethere strictly restricted (default true)
   */
  middlewares.loginRequired = function(isStrictly = true) {
    return function(req, res, next) {

      // when the route is not strictly restricted
      if (!isStrictly) {
        // when allowed to read
        if (crowi.aclService.isGuestAllowedToRead()) {
          logger.debug('Allowed to read: ', req.path);
          return next();
        }
      }

      const User = crowi.model('User');

      // check the user logged in
      //  make sure that req.user isn't username/email string to login which is set by basic-auth-connect
      if (req.user != null && (req.user instanceof Object) && '_id' in req.user) {
        if (req.user.status === User.STATUS_ACTIVE) {
          // Active の人だけ先に進める
          return next();
        }
        if (req.user.status === User.STATUS_REGISTERED) {
          return res.redirect('/login/error/registered');
        }
        if (req.user.status === User.STATUS_SUSPENDED) {
          return res.redirect('/login/error/suspended');
        }
        if (req.user.status === User.STATUS_INVITED) {
          return res.redirect('/login/invited');
        }
      }

      // is api path
      const path = req.path || '';
      if (path.match(/^\/_api\/.+$/)) {
        return res.sendStatus(403);
      }

      req.session.jumpTo = req.originalUrl;
      return res.redirect('/login');
    };
  };

  middlewares.accessTokenParser = function(req, res, next) {
    // TODO: comply HTTP header of RFC6750 / Authorization: Bearer
    const accessToken = req.query.access_token || req.body.access_token || null;
    if (!accessToken) {
      return next();
    }

    const User = crowi.model('User');

    debug('accessToken is', accessToken);
    User.findUserByApiToken(accessToken)
      .then((userData) => {
        req.user = userData;
        req.skipCsrfVerify = true;
        debug('Access token parsed: skipCsrfVerify');

        next();
      })
      .catch((err) => {
        next();
      });
  };

  // this is for Installer
  middlewares.applicationNotInstalled = async function(req, res, next) {
    const isInstalled = await appService.isDBInitialized();

    if (isInstalled) {
      req.flash('errorMessage', 'Application already installed.');
      return res.redirect('admin'); // admin以外はadminRequiredで'/'にリダイレクトされる
    }

    return next();
  };

  middlewares.applicationInstalled = async function(req, res, next) {
    const isInstalled = await appService.isDBInitialized();

    if (!isInstalled) {
      return res.redirect('/installer');
    }

    return next();
  };

  middlewares.awsEnabled = function() {
    return function(req, res, next) {
      if (configManager.getConfig('crowi', 'aws:region') !== ''
          && configManager.getConfig('crowi', 'aws:bucket') !== ''
          && configManager.getConfig('crowi', 'aws:accessKeyId') !== ''
          && configManager.getConfig('crowi', 'aws:secretAccessKey') !== '') {
        req.flash('globalError', 'AWS settings required to use this function. Please ask the administrator.');
        return res.redirect('/');
      }

      return next();
    };
  };

  return middlewares;
};
