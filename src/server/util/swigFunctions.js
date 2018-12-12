module.exports = function(crowi, app, req, locals) {
  const debug = require('debug')('growi:lib:swigFunctions')
    , stringWidth = require('string-width')
    , Page = crowi.model('Page')
    , Config = crowi.model('Config')
    , User = crowi.model('User')
    , passportService = crowi.passportService
    , cdnResourcesService = crowi.cdnResourcesService
  ;

  debug('initializing swigFunctions');

  locals.nodeVersion = function() {
    return crowi.runtimeVersions.versions.node ? crowi.runtimeVersions.versions.node.version : '-';
  };
  locals.npmVersion = function() {
    return crowi.runtimeVersions.versions.npm ? crowi.runtimeVersions.versions.npm.version : '-';
  };
  locals.yarnVersion = function() {
    return crowi.runtimeVersions.versions.yarn ? crowi.runtimeVersions.versions.yarn.version : '-';
  };

  locals.growiVersion = function() {
    return crowi.version;
  };

  // token getter
  locals.csrf = function() {
    return req.csrfToken;
  };

  locals.getAppTitleFontSize = function(appTitle) {
    let appTitleWidth = stringWidth(appTitle);
    let fontSize = 22;
    if (appTitleWidth < 13) { /* do nothing */ }
    else if (appTitleWidth < 21) {
      fontSize -= 3 * (Math.floor((appTitleWidth - 13) / 3) + 1);
    }
    else  {
      fontSize = 11;
    }
    return fontSize;
  };

  /**
   * return app title
   */
  locals.appTitle = function() {
    const config = crowi.getConfig();
    return crowi.xss.process(Config.appTitle(config));
  };

  /**
   * return app-global language
   */
  locals.appGlobalLang = function() {
    const config = crowi.getConfig();
    return Config.globalLang(config);
  };

  locals.noCdn = function() {
    return !!process.env.NO_CDN;
  };

  locals.cdnScriptTag = function(name) {
    return cdnResourcesService.getScriptTagByName(name);
  };
  locals.cdnScriptTagsByGroup = function(group) {
    const tags = cdnResourcesService.getScriptTagsByGroup(group);
    return tags.join('\n');
  };

  locals.cdnStyleTag = function(name) {
    return cdnResourcesService.getStyleTagByName(name);
  };

  locals.cdnStyleTagsByGroup = function(group) {
    const tags = cdnResourcesService.getStyleTagsByGroup(group);
    return tags.join('\n');
  };

  locals.cdnHighlightJsStyleTag = function(styleName) {
    return cdnResourcesService.getHighlightJsStyleTag(styleName);
  };

  /**
   * return true if enabled
   */
  locals.isEnabledPassport = function() {
    const config = crowi.getConfig();
    return Config.isEnabledPassport(config);
  };

  /**
   * return true if local strategy has been setup successfully
   *  used whether restarting the server needed
   */
  locals.isPassportLocalStrategySetup = function() {
    return passportService != null && passportService.isLocalStrategySetup;
  };

  /**
   * return true if enabled and strategy has been setup successfully
   */
  locals.isLdapSetup = function() {
    let config = crowi.getConfig();
    return Config.isEnabledPassport(config) && Config.isEnabledPassportLdap(config) && passportService.isLdapStrategySetup;
  };

  /**
   * return true if enabled but strategy has some problem
   */
  locals.isLdapSetupFailed = function() {
    let config = crowi.getConfig();
    return Config.isEnabledPassport(config) && Config.isEnabledPassportLdap(config) && !passportService.isLdapStrategySetup;
  };

  locals.passportSamlLoginEnabled = function() {
    let config = crowi.getConfig();
    return locals.isEnabledPassport() && config.crowi['security:passport-saml:isEnabled'];
  };

  locals.googleLoginEnabled = function() {
    // return false if Passport is enabled
    // because official crowi mechanism is not used.
    if (locals.isEnabledPassport()) {
      return false;
    }

    let config = crowi.getConfig();
    return config.crowi['google:clientId'] && config.crowi['google:clientSecret'];
  };

  locals.passportGoogleLoginEnabled = function() {
    let config = crowi.getConfig();
    return locals.isEnabledPassport() && config.crowi['security:passport-google:isEnabled'];
  };

  locals.passportGitHubLoginEnabled = function() {
    let config = crowi.getConfig();
    return locals.isEnabledPassport() && config.crowi['security:passport-github:isEnabled'];
  };

  locals.passportTwitterLoginEnabled = function() {
    let config = crowi.getConfig();
    return locals.isEnabledPassport() && config.crowi['security:passport-twitter:isEnabled'];
  };

  locals.searchConfigured = function() {
    if (crowi.getSearcher()) {
      return true;
    }
    return false;
  };

  locals.isHackmdSetup = function() {
    return process.env.HACKMD_URI != null;
  };

  locals.isEnabledPlugins = function() {
    let config = crowi.getConfig();
    return Config.isEnabledPlugins(config);
  };

  locals.isEnabledLinebreaks = function() {
    let config = crowi.getConfig();
    return Config.isEnabledLinebreaks(config);
  };

  locals.isEnabledLinebreaksInComments = function() {
    let config = crowi.getConfig();
    return Config.isEnabledLinebreaksInComments(config);
  };

  locals.customCss = function() {
    return Config.customCss();
  };

  locals.pageBreakSeparator = function() {
    let config = crowi.getConfig();
    return Config.pageBreakSeparator(config);
  };

  locals.pageBreakCustomSeparator = function() {
    let config = crowi.getConfig();
    return Config.pageBreakCustomSeparator(config);
  };

  locals.customScript = function() {
    return Config.customScript();
  };

  locals.customHeader = function() {
    let config = crowi.getConfig();
    return Config.customHeader(config);
  };

  locals.theme = function() {
    let config = crowi.getConfig();
    return Config.theme(config);
  };

  locals.customTitle = function(page) {
    const config = crowi.getConfig();
    return Config.customTitle(config, page);
  };

  locals.behaviorType = function() {
    let config = crowi.getConfig();
    return Config.behaviorType(config);
  };

  locals.layoutType = function() {
    let config = crowi.getConfig();
    return Config.layoutType(config);
  };

  locals.highlightJsStyle = function() {
    let config = crowi.getConfig();
    return Config.highlightJsStyle(config);
  };

  locals.highlightJsStyleBorder = function() {
    let config = crowi.getConfig();
    return Config.highlightJsStyleBorder(config);
  };

  locals.isEnabledTimeline = function() {
    let config = crowi.getConfig();
    return Config.isEnabledTimeline(config);
  };

  locals.isUploadable = function() {
    let config = crowi.getConfig();
    return Config.isUploadable(config);
  };

  locals.isEnabledAttachTitleHeader = function() {
    let config = crowi.getConfig();
    return Config.isEnabledAttachTitleHeader(config);
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
    if (path.match(/^\/user\/[^/]+\/$/)) {
      return true;
    }

    return false;
  };

  locals.isTopPage = function() {
    let path = req.path || '';
    if (path === '/') {
      return true;
    }

    return false;
  };

  locals.isTrashPage = function() {
    let path = req.path || '';
    if (path.match(/^\/trash\/.*/)) {
      return true;
    }

    return false;
  };

  locals.isDeletablePage = function() {
    let Page = crowi.model('Page');
    let path = req.path || '';

    return Page.isDeletableName(path);
  };

  locals.userPageRoot = function(user) {
    if (!user || !user.username) {
      return '';
    }
    return '/user/' + user.username;
  };

  locals.css = {
    grant: function(pageData) {
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
    userStatus: function(user) {
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
