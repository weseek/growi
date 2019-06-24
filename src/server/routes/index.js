const multer = require('multer');
const autoReap = require('multer-autoreap');

autoReap.options.reapOnError = true; // continue reaping the file even if an error occurs

module.exports = function(crowi, app) {
  const middlewares = require('../util/middlewares')(crowi, app);
  const uploads = multer({ dest: `${crowi.tmpDir}uploads` });
  const form = require('../form');
  const page = require('./page')(crowi, app);
  const login = require('./login')(crowi, app);
  const loginPassport = require('./login-passport')(crowi, app);
  const logout = require('./logout')(crowi, app);
  const me = require('./me')(crowi, app);
  const admin = require('./admin')(crowi, app);
  const installer = require('./installer')(crowi, app);
  const user = require('./user')(crowi, app);
  const attachment = require('./attachment')(crowi, app);
  const comment = require('./comment')(crowi, app);
  const bookmark = require('./bookmark')(crowi, app);
  const tag = require('./tag')(crowi, app);
  const revision = require('./revision')(crowi, app);
  const search = require('./search')(crowi, app);
  const hackmd = require('./hackmd')(crowi, app);
  const {
    loginRequired,
    adminRequired,
    accessTokenParser,
    csrfVerify: csrf,
  } = middlewares;

  /* eslint-disable max-len, comma-spacing, no-multi-spaces */

  app.get('/'                        , middlewares.applicationInstalled, loginRequired(false) , page.showTopPage);

  app.get('/installer'               , middlewares.applicationNotInstalled , installer.index);
  app.post('/installer'              , middlewares.applicationNotInstalled , form.register , csrf, installer.install);

  app.get('/login/error/:reason'     , login.error);
  app.get('/login'                   , middlewares.applicationInstalled    , login.login);
  app.get('/login/invited'           , login.invited);
  app.post('/login/activateInvited'  , form.invited                         , csrf, login.invited);
  app.post('/login'                  , form.login                           , csrf, loginPassport.loginWithLocal, loginPassport.loginWithLdap, loginPassport.loginFailure);
  app.post('/_api/login/testLdap'    , loginRequired() , form.login , loginPassport.testLdapCredentials);

  app.post('/register'               , form.register                        , csrf, login.register);
  app.get('/register'                , middlewares.applicationInstalled    , login.register);
  app.get('/logout'                  , logout.logout);

  app.get('/admin'                          , loginRequired() , adminRequired , admin.index);
  app.get('/admin/app'                      , loginRequired() , adminRequired , admin.app.index);
  app.post('/_api/admin/settings/app'       , loginRequired() , adminRequired , csrf, form.admin.app, admin.api.appSetting);
  app.post('/_api/admin/settings/siteUrl'   , loginRequired() , adminRequired , csrf, form.admin.siteUrl, admin.api.asyncAppSetting);
  app.post('/_api/admin/settings/mail'      , loginRequired() , adminRequired , csrf, form.admin.mail, admin.api.appSetting);
  app.post('/_api/admin/settings/aws'       , loginRequired() , adminRequired , csrf, form.admin.aws, admin.api.appSetting);
  app.post('/_api/admin/settings/plugin'    , loginRequired() , adminRequired , csrf, form.admin.plugin, admin.api.appSetting);

  // security admin
  app.get('/admin/security'                     , loginRequired() , adminRequired , admin.security.index);
  app.post('/_api/admin/security/general'       , loginRequired() , adminRequired , form.admin.securityGeneral, admin.api.securitySetting);
  app.post('/_api/admin/security/passport-ldap' , loginRequired() , adminRequired , csrf, form.admin.securityPassportLdap, admin.api.securityPassportLdapSetting);
  app.post('/_api/admin/security/passport-saml' , loginRequired() , adminRequired , csrf, form.admin.securityPassportSaml, admin.api.securityPassportSamlSetting);

  // OAuth
  app.post('/_api/admin/security/passport-google' , loginRequired() , adminRequired , csrf, form.admin.securityPassportGoogle, admin.api.securityPassportGoogleSetting);
  app.post('/_api/admin/security/passport-github' , loginRequired() , adminRequired , csrf, form.admin.securityPassportGitHub, admin.api.securityPassportGitHubSetting);
  app.post('/_api/admin/security/passport-twitter', loginRequired() , adminRequired , csrf, form.admin.securityPassportTwitter, admin.api.securityPassportTwitterSetting);
  app.post('/_api/admin/security/passport-oidc',    loginRequired() , adminRequired , csrf, form.admin.securityPassportOidc, admin.api.securityPassportOidcSetting);
  app.get('/passport/google'                      , loginPassport.loginWithGoogle);
  app.get('/passport/github'                      , loginPassport.loginWithGitHub);
  app.get('/passport/twitter'                     , loginPassport.loginWithTwitter);
  app.get('/passport/oidc'                        , loginPassport.loginWithOidc);
  app.get('/passport/saml'                        , loginPassport.loginWithSaml);
  app.get('/passport/google/callback'             , loginPassport.loginPassportGoogleCallback);
  app.get('/passport/github/callback'             , loginPassport.loginPassportGitHubCallback);
  app.get('/passport/twitter/callback'            , loginPassport.loginPassportTwitterCallback);
  app.get('/passport/oidc/callback'               , loginPassport.loginPassportOidcCallback);
  app.post('/passport/saml/callback'              , loginPassport.loginPassportSamlCallback);

  // markdown admin
  app.get('/admin/markdown'                   , loginRequired() , adminRequired , admin.markdown.index);
  app.post('/admin/markdown/lineBreaksSetting', loginRequired() , adminRequired , csrf, form.admin.markdown, admin.markdown.lineBreaksSetting); // change form name
  app.post('/admin/markdown/xss-setting'      , loginRequired() , adminRequired , csrf, form.admin.markdownXss, admin.markdown.xssSetting);
  app.post('/admin/markdown/presentationSetting', loginRequired() , adminRequired , csrf, form.admin.markdownPresentation, admin.markdown.presentationSetting);

  // markdown admin
  app.get('/admin/customize'                , loginRequired() , adminRequired , admin.customize.index);
  app.post('/_api/admin/customize/css'      , loginRequired() , adminRequired , csrf, form.admin.customcss, admin.api.customizeSetting);
  app.post('/_api/admin/customize/script'   , loginRequired() , adminRequired , csrf, form.admin.customscript, admin.api.customizeSetting);
  app.post('/_api/admin/customize/header'   , loginRequired() , adminRequired , csrf, form.admin.customheader, admin.api.customizeSetting);
  app.post('/_api/admin/customize/theme'    , loginRequired() , adminRequired , csrf, form.admin.customtheme, admin.api.customizeSetting);
  app.post('/_api/admin/customize/title'    , loginRequired() , adminRequired , csrf, form.admin.customtitle, admin.api.customizeSetting);
  app.post('/_api/admin/customize/behavior' , loginRequired() , adminRequired , csrf, form.admin.custombehavior, admin.api.customizeSetting);
  app.post('/_api/admin/customize/layout'   , loginRequired() , adminRequired , csrf, form.admin.customlayout, admin.api.customizeSetting);
  app.post('/_api/admin/customize/features' , loginRequired() , adminRequired , csrf, form.admin.customfeatures, admin.api.customizeSetting);
  app.post('/_api/admin/customize/highlightJsStyle' , loginRequired() , adminRequired , csrf, form.admin.customhighlightJsStyle, admin.api.customizeSetting);

  // search admin
  app.get('/admin/search'              , loginRequired() , adminRequired , admin.search.index);
  app.post('/_api/admin/search/build'  , loginRequired() , adminRequired , csrf, admin.api.searchBuildIndex);

  // notification admin
  app.get('/admin/notification'              , loginRequired() , adminRequired , admin.notification.index);
  app.post('/admin/notification/slackIwhSetting', loginRequired() , adminRequired , csrf, form.admin.slackIwhSetting, admin.notification.slackIwhSetting);
  app.post('/admin/notification/slackSetting', loginRequired() , adminRequired , csrf, form.admin.slackSetting, admin.notification.slackSetting);
  app.get('/admin/notification/slackAuth'    , loginRequired() , adminRequired , admin.notification.slackAuth);
  app.get('/admin/notification/slackSetting/disconnect', loginRequired() , adminRequired , admin.notification.disconnectFromSlack);
  app.post('/_api/admin/notification.add'    , loginRequired() , adminRequired , csrf, admin.api.notificationAdd);
  app.post('/_api/admin/notification.remove' , loginRequired() , adminRequired , csrf, admin.api.notificationRemove);
  app.get('/_api/admin/users.search'         , loginRequired() , adminRequired , admin.api.usersSearch);
  app.get('/admin/global-notification/new'   , loginRequired() , adminRequired , admin.globalNotification.detail);
  app.get('/admin/global-notification/:id'   , loginRequired() , adminRequired , admin.globalNotification.detail);
  app.post('/admin/global-notification/new'  , loginRequired() , adminRequired , form.admin.notificationGlobal, admin.globalNotification.create);
  app.post('/_api/admin/global-notification/toggleIsEnabled', loginRequired() , adminRequired , admin.api.toggleIsEnabledForGlobalNotification);
  app.post('/admin/global-notification/:id/update', loginRequired() , adminRequired , form.admin.notificationGlobal, admin.globalNotification.update);
  app.post('/admin/global-notification/:id/remove', loginRequired() , adminRequired , admin.globalNotification.remove);

  app.get('/admin/users'                , loginRequired() , adminRequired , admin.user.index);
  app.post('/admin/user/invite'         , form.admin.userInvite ,  loginRequired() , adminRequired , csrf, admin.user.invite);
  app.post('/admin/user/:id/makeAdmin'  , loginRequired() , adminRequired , csrf, admin.user.makeAdmin);
  app.post('/admin/user/:id/removeFromAdmin', loginRequired() , adminRequired , admin.user.removeFromAdmin);
  app.post('/admin/user/:id/activate'   , loginRequired() , adminRequired , csrf, admin.user.activate);
  app.post('/admin/user/:id/suspend'    , loginRequired() , adminRequired , csrf, admin.user.suspend);
  app.post('/admin/user/:id/remove'     , loginRequired() , adminRequired , csrf, admin.user.remove);
  app.post('/admin/user/:id/removeCompletely' , loginRequired() , adminRequired , csrf, admin.user.removeCompletely);
  // new route patterns from here:
  app.post('/_api/admin/users.resetPassword'  , loginRequired() , adminRequired , csrf, admin.user.resetPassword);

  app.get('/admin/users/external-accounts'               , loginRequired() , adminRequired , admin.externalAccount.index);
  app.post('/admin/users/external-accounts/:id/remove'   , loginRequired() , adminRequired , admin.externalAccount.remove);

  // user-groups admin
  app.get('/admin/user-groups'             , loginRequired(), adminRequired, admin.userGroup.index);
  app.get('/admin/user-group-detail/:id'          , loginRequired(), adminRequired, admin.userGroup.detail);
  app.post('/admin/user-group/create'      , form.admin.userGroupCreate, loginRequired(), adminRequired, csrf, admin.userGroup.create);
  app.post('/admin/user-group/:userGroupId/update', loginRequired(), adminRequired, csrf, admin.userGroup.update);
  app.post('/admin/user-group.remove' , loginRequired(), adminRequired, csrf, admin.userGroup.removeCompletely);
  app.get('/_api/admin/user-groups', loginRequired(), adminRequired, admin.api.userGroups);

  // user-group-relations admin
  app.post('/admin/user-group-relation/create', loginRequired(), adminRequired, csrf, admin.userGroupRelation.create);
  app.post('/admin/user-group-relation/:id/remove-relation/:relationId', loginRequired(), adminRequired, csrf, admin.userGroupRelation.remove);

  // importer management for admin
  app.get('/admin/importer'                , loginRequired() , adminRequired , admin.importer.index);
  app.post('/_api/admin/settings/importerEsa' , loginRequired() , adminRequired , csrf , form.admin.importerEsa , admin.api.importerSettingEsa);
  app.post('/_api/admin/settings/importerQiita' , loginRequired() , adminRequired , csrf , form.admin.importerQiita , admin.api.importerSettingQiita);
  app.post('/_api/admin/import/esa'        , loginRequired() , adminRequired , admin.api.importDataFromEsa);
  app.post('/_api/admin/import/testEsaAPI' , loginRequired() , adminRequired , csrf , form.admin.importerEsa , admin.api.testEsaAPI);
  app.post('/_api/admin/import/qiita'        , loginRequired() , adminRequired , admin.api.importDataFromQiita);
  app.post('/_api/admin/import/testQiitaAPI' , loginRequired() , adminRequired , csrf , form.admin.importerQiita , admin.api.testQiitaAPI);

  app.get('/me'                       , loginRequired() , me.index);
  app.get('/me/password'              , loginRequired() , me.password);
  app.get('/me/apiToken'              , loginRequired() , me.apiToken);
  app.post('/me'                      , loginRequired() , csrf , form.me.user , me.index);
  // external-accounts
  app.get('/me/external-accounts'                         , loginRequired() , me.externalAccounts.list);
  app.post('/me/external-accounts/disassociate'           , loginRequired() , me.externalAccounts.disassociate);
  app.post('/me/external-accounts/associateLdap'          , loginRequired() , form.login , me.externalAccounts.associateLdap);

  app.post('/me/password'             , form.me.password          , loginRequired() , me.password);
  app.post('/me/imagetype'            , form.me.imagetype         , loginRequired() , me.imagetype);
  app.post('/me/apiToken'             , form.me.apiToken          , loginRequired() , me.apiToken);

  app.get('/:id([0-9a-z]{24})'       , loginRequired(false) , page.redirector);
  app.get('/_r/:id([0-9a-z]{24})'    , loginRequired(false) , page.redirector); // alias
  app.get('/attachment/:pageId/:fileName'  , loginRequired(false), attachment.api.obsoletedGetForMongoDB); // DEPRECATED: remains for backward compatibility for v3.3.x or below
  app.get('/attachment/:id([0-9a-z]{24})'  , loginRequired(false), attachment.api.get);
  app.get('/download/:id([0-9a-z]{24})'    , loginRequired(false), attachment.api.download);

  app.get('/_search'                 , loginRequired(false) , search.searchPage);
  app.get('/_api/search'             , accessTokenParser , loginRequired(false) , search.api.search);

  app.get('/_api/check_username'           , user.api.checkUsername);
  app.get('/_api/me/user-group-relations'  , accessTokenParser , loginRequired() , me.api.userGroupRelations);
  app.get('/_api/user/bookmarks'           , loginRequired(false) , user.api.bookmarks);

  // HTTP RPC Styled API (に徐々に移行していいこうと思う)
  app.get('/_api/users.list'          , accessTokenParser , loginRequired(false) , user.api.list);
  app.get('/_api/pages.list'          , accessTokenParser , loginRequired(false) , page.api.list);
  app.get('/_api/pages.recentCreated' , accessTokenParser , loginRequired(false) , page.api.recentCreated);
  app.post('/_api/pages.create'       , accessTokenParser , loginRequired() , csrf, page.api.create);
  app.post('/_api/pages.update'       , accessTokenParser , loginRequired() , csrf, page.api.update);
  app.get('/_api/pages.get'           , accessTokenParser , loginRequired(false) , page.api.get);
  app.get('/_api/pages.exist'         , accessTokenParser , loginRequired(false) , page.api.exist);
  app.get('/_api/pages.updatePost'    , accessTokenParser, loginRequired(false), page.api.getUpdatePost);
  app.get('/_api/pages.getPageTag'    , accessTokenParser , loginRequired(false) , page.api.getPageTag);
  // allow posting to guests because the client doesn't know whether the user logged in
  app.post('/_api/pages.seen'         , accessTokenParser , loginRequired(false) , page.api.seen);
  app.post('/_api/pages.rename'       , accessTokenParser , loginRequired() , csrf, page.api.rename);
  app.post('/_api/pages.remove'       , loginRequired() , csrf, page.api.remove); // (Avoid from API Token)
  app.post('/_api/pages.revertRemove' , loginRequired() , csrf, page.api.revertRemove); // (Avoid from API Token)
  app.post('/_api/pages.unlink'       , loginRequired() , csrf, page.api.unlink); // (Avoid from API Token)
  app.post('/_api/pages.duplicate'    , accessTokenParser, loginRequired(), csrf, page.api.duplicate);
  app.get('/tags'                     , loginRequired(false), tag.showPage);
  app.get('/_api/tags.list'           , accessTokenParser, loginRequired(false), tag.api.list);
  app.get('/_api/tags.search'         , accessTokenParser, loginRequired(false), tag.api.search);
  app.post('/_api/tags.update'        , accessTokenParser, loginRequired(false), tag.api.update);
  app.get('/_api/comments.get'        , accessTokenParser , loginRequired(false) , comment.api.get);
  app.post('/_api/comments.add'       , comment.api.validators.add(), accessTokenParser , loginRequired() , csrf, comment.api.add);
  app.post('/_api/comments.remove'    , accessTokenParser , loginRequired() , csrf, comment.api.remove);
  app.get('/_api/bookmarks.get'       , accessTokenParser , loginRequired(false) , bookmark.api.get);
  app.post('/_api/bookmarks.add'      , accessTokenParser , loginRequired() , csrf, bookmark.api.add);
  app.post('/_api/bookmarks.remove'   , accessTokenParser , loginRequired() , csrf, bookmark.api.remove);
  app.post('/_api/likes.add'          , accessTokenParser , loginRequired() , csrf, page.api.like);
  app.post('/_api/likes.remove'       , accessTokenParser , loginRequired() , csrf, page.api.unlike);
  app.get('/_api/attachments.list'    , accessTokenParser , loginRequired(false) , attachment.api.list);
  app.post('/_api/attachments.add'                  , uploads.single('file'), autoReap, accessTokenParser, loginRequired() ,csrf, attachment.api.add);
  app.post('/_api/attachments.uploadProfileImage'   , uploads.single('file'), autoReap, accessTokenParser, loginRequired() ,csrf, attachment.api.uploadProfileImage);
  app.post('/_api/attachments.remove'               , accessTokenParser , loginRequired() , csrf, attachment.api.remove);
  app.post('/_api/attachments.removeProfileImage'   , accessTokenParser , loginRequired() , csrf, attachment.api.removeProfileImage);
  app.get('/_api/attachments.limit'   , accessTokenParser , loginRequired(), attachment.api.limit);

  app.get('/_api/revisions.get'       , accessTokenParser , loginRequired(false) , revision.api.get);
  app.get('/_api/revisions.ids'       , accessTokenParser , loginRequired(false) , revision.api.ids);
  app.get('/_api/revisions.list'      , accessTokenParser , loginRequired(false) , revision.api.list);

  app.get('/trash$'                   , loginRequired(false) , page.trashPageShowWrapper);
  app.get('/trash/$'                  , loginRequired(false) , page.trashPageListShowWrapper);
  app.get('/trash/*/$'                , loginRequired(false) , page.deletedPageListShowWrapper);

  app.get('/_hackmd/load-agent'          , hackmd.loadAgent);
  app.get('/_hackmd/load-styles'         , hackmd.loadStyles);
  app.post('/_api/hackmd.integrate'      , accessTokenParser , loginRequired() , csrf, hackmd.validateForApi, hackmd.integrate);
  app.post('/_api/hackmd.saveOnHackmd'   , accessTokenParser , loginRequired() , csrf, hackmd.validateForApi, hackmd.saveOnHackmd);

  // API v3
  app.use('/api-docs', require('./apiv3/docs')(crowi));
  app.use('/_api/v3', require('./apiv3')(crowi));

  app.get('/*/$'                   , loginRequired(false) , page.showPageWithEndOfSlash, page.notFound);
  app.get('/*'                     , loginRequired(false) , page.showPage, page.notFound);
};
