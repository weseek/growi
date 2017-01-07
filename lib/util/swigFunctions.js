module.exports = function(crowi, app, req, locals) {
  var debug = require('debug')('crowi:lib:swigFunctions')
    , Page = crowi.model('Page')
    , Config = crowi.model('Config')
    , User = crowi.model('User')
  ;

  // token getter
  locals.csrf = function() {
    return req.csrfToken;
  };

  locals.assets = function(file) {
    var assetList = crowi.getAssetList();
    var baseName = file.match(/\/([^\/]+)$/)[1];

    var baseNameWithHash = '';
    if (assetList[baseName]) {
      baseNameWithHash = assetList[baseName];
    } else {
      return file;
    }

    return file.replace(baseName, baseNameWithHash);
  };

  locals.googleLoginEnabled = function() {
    var config = crowi.getConfig()
    return config.crowi['google:clientId'] && config.crowi['google:clientSecret'];
  };

  locals.searchConfigured = function() {
    if (crowi.getSearcher()) {
      return true;
    }
    return false;
  };

  locals.slackConfigured = function() {
    var config = crowi.getConfig()
    if (Config.hasSlackToken(config)) {
      return true;
    }
    return false;
  };

  locals.isUploadable = function() {
    var config = crowi.getConfig()
    return Config.isUploadable(config);
  };

  locals.parentPath = function(path) {
    if (path == '/') {
      return path;
    }

    if (path.match(/.+\/$/)) {
      return path;
    }

    return path + '/';
  };

  locals.isUserPageList = function(path) {
    if (path.match(/^\/user\/[^\/]+\/$/)) {
      return true;
    }

    return false;
  };

  locals.isTopPage = function() {
    var path = req.path || '';
    if (path === '/') {
      return true;
    }

    return false;
  };

  locals.isTrashPage = function() {
    var path = req.path || '';
    if (path.match(/^\/trash\/.*/)) {
      return true;
    }

    return false;
  };

  locals.isDeletablePage = function() {
    var Page = crowi.model('Page');
    var path = req.path || '';

    return Page.isDeletableName(path);
  };

  locals.userPageRoot = function(user) {
    if (!user || !user.username) {
      return '';
    }
    return '/user/' + user.username;
  };

  locals.css = {
    grant: function (pageData) {
      if (!pageData) {
        return '';
      }

      switch (pageData.grant) {
        case Page.GRANT_PUBLIC:
          return 'grant-public';
        case Page.GRANT_RESTRICTED:
          return 'grant-restricted';
        //case Page.GRANT_SPECIFIED:
        //  return 'grant-specified';
        //  break;
        case Page.GRANT_OWNER:
          return 'grant-owner';
        default:
          break;
      }
      return '';
    },
    userStatus: function (user) {
      //debug('userStatus', user._id, user.usename, user.status);

      switch (user.status) {
        case User.STATUS_REGISTERED:
          return 'label-info';
        case User.STATUS_ACTIVE:
          return 'label-success';
        case User.STATUS_SUSPENDED:
          return 'label-warning';
        case User.STATUS_DELETED:
          return 'label-danger';
        case User.STATUS_INVITED:
          return 'label-info';
        default:
          break;
      }
      return '';
    },
  };
};
