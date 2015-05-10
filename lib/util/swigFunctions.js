module.exports = function(crowi, app, locals) {
  var debug = require('debug')('crowi:lib:swigFunctions')
    , Page = crowi.model('Page')
    , User = crowi.model('User')
  ;

  locals.facebookLoginEnabled = function() {
    var config = crowi.getConfig()
    return config.crowi['facebook:appId'] && config.crowi['facebook:secret'];
  };

  locals.googleLoginEnabled = function() {
    var config = crowi.getConfig()
    return config.crowi['google:clientId'] && config.crowi['google:clientSecret'];
  };

  locals.user_page_root = function(user) {
    if (!user) {
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
