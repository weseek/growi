// don't add any more middlewares to this file.
// all new middlewares should be an independent file under /server/routes/middlewares
// eslint-disable-next-line no-unused-vars

const logger = require('@alias/logger')('growi:lib:middlewares');

const { formatDistanceStrict } = require('date-fns');
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

      swig.setFilter('dateDistance', (input) => {
        return formatDistanceStrict(input, new Date());
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
      if ((configManager.getConfig('crowi', 'aws:region') !== '' || this.configManager.getConfig('crowi', 'aws:customEndpoint') !== '')
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
