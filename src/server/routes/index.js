const multer = require('multer');
const autoReap = require('multer-autoreap');

autoReap.options.reapOnError = true; // continue reaping the file even if an error occurs

module.exports = function(crowi, app) {
  const middlewares = require('../util/middlewares')(crowi, app);
  const accessTokenParser = require('../middleware/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../middleware/login-required')(crowi);
  const loginRequired = require('../middleware/login-required')(crowi, true);
  const adminRequired = require('../middleware/admin-required')(crowi);
  const csrf = require('../middleware/csrf')(crowi);

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

  const isInstalled = crowi.configManager.getConfig('crowi', 'app:installed');

  /* eslint-disable max-len, comma-spacing, no-multi-spaces */

  app.get('/'                        , middlewares.applicationInstalled, loginRequired , page.showTopPage);

  // API v3
  app.use('/api-docs', require('./apiv3/docs')(crowi));
  app.use('/_api/v3', require('./apiv3')(crowi));

  // installer
  if (!isInstalled) {
    app.get('/installer'               , middlewares.applicationNotInstalled , installer.index);
    app.post('/installer'              , middlewares.applicationNotInstalled , form.register , csrf, installer.install);
    return;
  }

  app.get('/login/error/:reason'     , login.error);
  app.get('/login'                   , middlewares.applicationInstalled     , login.preLogin, login.login);
  app.get('/login/invited'           , login.invited);
  app.post('/login/activateInvited'  , form.invited                         , csrf, login.invited);
  app.post('/login'                  , form.login                           , csrf, loginPassport.loginWithLocal, loginPassport.loginWithLdap, loginPassport.loginFailure);
  app.post('/_api/login/testLdap'    , loginRequiredStrictly , form.login , loginPassport.testLdapCredentials);

  app.post('/register'               , form.register                        , csrf, login.register);
  app.get('/register'                , middlewares.applicationInstalled     , login.preLogin, login.register);
  app.get('/logout'                  , logout.logout);

  app.get('/admin'                          , loginRequiredStrictly , adminRequired , admin.index);
  app.get('/admin/app'                      , loginRequiredStrictly , adminRequired , admin.app.index);

  // security admin
  app.get('/admin/security'                     , loginRequiredStrictly , adminRequired , admin.security.index);

  // OAuth
  app.get('/passport/google'                      , loginPassport.loginWithGoogle);
  app.get('/passport/github'                      , loginPassport.loginWithGitHub);
  app.get('/passport/twitter'                     , loginPassport.loginWithTwitter);
  app.get('/passport/oidc'                        , loginPassport.loginWithOidc);
  app.get('/passport/saml'                        , loginPassport.loginWithSaml);
  app.get('/passport/basic'                       , loginPassport.loginWithBasic);
  app.get('/passport/google/callback'             , loginPassport.loginPassportGoogleCallback);
  app.get('/passport/github/callback'             , loginPassport.loginPassportGitHubCallback);
  app.get('/passport/twitter/callback'            , loginPassport.loginPassportTwitterCallback);
  app.get('/passport/oidc/callback'               , loginPassport.loginPassportOidcCallback);
  app.post('/passport/saml/callback'              , loginPassport.loginPassportSamlCallback);

  // markdown admin
  app.get('/admin/markdown'                   , loginRequiredStrictly , adminRequired , admin.markdown.index);

  // customize admin
  app.get('/admin/customize'                , loginRequiredStrictly , adminRequired , admin.customize.index);

  // search admin
  app.get('/admin/search'              , loginRequiredStrictly , adminRequired , admin.search.index);

  // notification admin
  app.get('/admin/notification'              , loginRequiredStrictly , adminRequired , admin.notification.index);
  app.get('/admin/notification/slackAuth'    , loginRequiredStrictly , adminRequired , admin.notification.slackAuth);
  app.get('/admin/notification/slackSetting/disconnect', loginRequiredStrictly , adminRequired , admin.notification.disconnectFromSlack);
  app.get('/_api/admin/users.search'         , loginRequiredStrictly , adminRequired , admin.api.usersSearch);
  app.get('/admin/global-notification/new'   , loginRequiredStrictly , adminRequired , admin.globalNotification.detail);
  app.get('/admin/global-notification/:id'   , loginRequiredStrictly , adminRequired , admin.globalNotification.detail);

  app.get('/admin/users'                , loginRequiredStrictly , adminRequired , admin.user.index);
  app.post('/admin/user/:id/removeCompletely' , loginRequiredStrictly , adminRequired , csrf, admin.user.removeCompletely);
  // new route patterns from here:
  app.post('/_api/admin/users.resetPassword'  , loginRequiredStrictly , adminRequired , csrf, admin.user.resetPassword);

  app.get('/admin/users/external-accounts'               , loginRequiredStrictly , adminRequired , admin.externalAccount.index);
  app.post('/admin/users/external-accounts/:id/remove'   , loginRequiredStrictly , adminRequired , admin.externalAccount.remove);

  // user-groups admin
  app.get('/admin/user-groups'             , loginRequiredStrictly, adminRequired, admin.userGroup.index);
  app.get('/admin/user-group-detail/:id'   , loginRequiredStrictly, adminRequired, admin.userGroup.detail);

  // importer management for admin
  app.get('/admin/importer'                     , loginRequiredStrictly , adminRequired , admin.importer.index);
  app.post('/_api/admin/settings/importerEsa'   , loginRequiredStrictly , adminRequired , csrf, admin.importer.api.validators.importer.esa(),admin.api.importerSettingEsa);
  app.post('/_api/admin/settings/importerQiita' , loginRequiredStrictly , adminRequired , csrf , admin.importer.api.validators.importer.qiita(), admin.api.importerSettingQiita);
  app.post('/_api/admin/import/esa'             , loginRequiredStrictly , adminRequired , admin.api.importDataFromEsa);
  app.post('/_api/admin/import/testEsaAPI'      , loginRequiredStrictly , adminRequired , csrf, admin.api.testEsaAPI);
  app.post('/_api/admin/import/qiita'           , loginRequiredStrictly , adminRequired , admin.api.importDataFromQiita);
  app.post('/_api/admin/import/testQiitaAPI'    , loginRequiredStrictly , adminRequired , csrf, admin.api.testQiitaAPI);

  // export management for admin
  app.get('/admin/export'                       , loginRequiredStrictly , adminRequired ,admin.export.index);
  app.get('/admin/export/:fileName'             , loginRequiredStrictly , adminRequired ,admin.export.download);

  app.get('/me'                       , loginRequiredStrictly , me.index);
  app.get('/me/password'              , loginRequiredStrictly , me.password);
  app.get('/me/apiToken'              , loginRequiredStrictly , me.apiToken);
  app.post('/me'                      , loginRequiredStrictly , csrf , form.me.user , me.index);
  // external-accounts
  app.get('/me/external-accounts'                         , loginRequiredStrictly , me.externalAccounts.list);
  app.post('/me/external-accounts/disassociate'           , loginRequiredStrictly , me.externalAccounts.disassociate);
  app.post('/me/external-accounts/associateLdap'          , loginRequiredStrictly , form.login , me.externalAccounts.associateLdap);

  app.post('/me/password'             , form.me.password          , loginRequiredStrictly , me.password);
  app.post('/me/imagetype'            , form.me.imagetype         , loginRequiredStrictly , me.imagetype);
  app.post('/me/apiToken'             , form.me.apiToken          , loginRequiredStrictly , me.apiToken);

  app.get('/:id([0-9a-z]{24})'       , loginRequired , page.redirector);
  app.get('/_r/:id([0-9a-z]{24})'    , loginRequired , page.redirector); // alias
  app.get('/attachment/:pageId/:fileName'  , loginRequired, attachment.api.obsoletedGetForMongoDB); // DEPRECATED: remains for backward compatibility for v3.3.x or below
  app.get('/attachment/:id([0-9a-z]{24})'  , loginRequired, attachment.api.get);
  app.get('/download/:id([0-9a-z]{24})'    , loginRequired, attachment.api.download);

  app.get('/_search'                 , loginRequired , search.searchPage);
  app.get('/_api/search'             , accessTokenParser , loginRequired , search.api.search);

  app.get('/_api/check_username'           , user.api.checkUsername);
  app.get('/_api/me/user-group-relations'  , accessTokenParser , loginRequiredStrictly , me.api.userGroupRelations);
  app.get('/_api/user/bookmarks'           , loginRequired , user.api.bookmarks);

  // HTTP RPC Styled API (に徐々に移行していいこうと思う)
  app.get('/_api/users.list'          , accessTokenParser , loginRequired , user.api.list);
  app.get('/_api/pages.list'          , accessTokenParser , loginRequired , page.api.list);
  app.get('/_api/pages.recentCreated' , accessTokenParser , loginRequired , page.api.recentCreated);
  app.post('/_api/pages.create'       , accessTokenParser , loginRequiredStrictly , csrf, page.api.create);
  app.post('/_api/pages.update'       , accessTokenParser , loginRequiredStrictly , csrf, page.api.update);
  app.get('/_api/pages.get'           , accessTokenParser , loginRequired , page.api.get);
  app.get('/_api/pages.exist'         , accessTokenParser , loginRequired , page.api.exist);
  app.get('/_api/pages.updatePost'    , accessTokenParser, loginRequired, page.api.getUpdatePost);
  app.get('/_api/pages.getPageTag'    , accessTokenParser , loginRequired , page.api.getPageTag);
  // allow posting to guests because the client doesn't know whether the user logged in
  app.post('/_api/pages.seen'         , accessTokenParser , loginRequired , page.api.seen);
  app.post('/_api/pages.rename'       , accessTokenParser , loginRequiredStrictly , csrf, page.api.rename);
  app.post('/_api/pages.remove'       , loginRequiredStrictly , csrf, page.api.remove); // (Avoid from API Token)
  app.post('/_api/pages.revertRemove' , loginRequiredStrictly , csrf, page.api.revertRemove); // (Avoid from API Token)
  app.post('/_api/pages.unlink'       , loginRequiredStrictly , csrf, page.api.unlink); // (Avoid from API Token)
  app.post('/_api/pages.duplicate'    , accessTokenParser, loginRequiredStrictly, csrf, page.api.duplicate);
  app.get('/tags'                     , loginRequired, tag.showPage);
  app.get('/_api/tags.list'           , accessTokenParser, loginRequired, tag.api.list);
  app.get('/_api/tags.search'         , accessTokenParser, loginRequired, tag.api.search);
  app.post('/_api/tags.update'        , accessTokenParser, loginRequired, tag.api.update);
  app.get('/_api/comments.get'        , accessTokenParser , loginRequired , comment.api.get);
  app.post('/_api/comments.add'       , comment.api.validators.add(), accessTokenParser , loginRequiredStrictly , csrf, comment.api.add);
  app.post('/_api/comments.update'    , comment.api.validators.add(), accessTokenParser , loginRequiredStrictly , csrf, comment.api.update);
  app.post('/_api/comments.remove'    , accessTokenParser , loginRequiredStrictly , csrf, comment.api.remove);
  app.get('/_api/bookmarks.get'       , accessTokenParser , loginRequired , bookmark.api.get);
  app.post('/_api/bookmarks.add'      , accessTokenParser , loginRequiredStrictly , csrf, bookmark.api.add);
  app.post('/_api/bookmarks.remove'   , accessTokenParser , loginRequiredStrictly , csrf, bookmark.api.remove);
  app.post('/_api/likes.add'          , accessTokenParser , loginRequiredStrictly , csrf, page.api.like);
  app.post('/_api/likes.remove'       , accessTokenParser , loginRequiredStrictly , csrf, page.api.unlike);
  app.get('/_api/attachments.list'    , accessTokenParser , loginRequired , attachment.api.list);
  app.post('/_api/attachments.add'                  , uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly ,csrf, attachment.api.add);
  app.post('/_api/attachments.uploadProfileImage'   , uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly ,csrf, attachment.api.uploadProfileImage);
  app.post('/_api/attachments.remove'               , accessTokenParser , loginRequiredStrictly , csrf, attachment.api.remove);
  app.post('/_api/attachments.removeProfileImage'   , accessTokenParser , loginRequiredStrictly , csrf, attachment.api.removeProfileImage);
  app.get('/_api/attachments.limit'   , accessTokenParser , loginRequiredStrictly, attachment.api.limit);

  app.get('/_api/revisions.get'       , accessTokenParser , loginRequired , revision.api.get);
  app.get('/_api/revisions.ids'       , accessTokenParser , loginRequired , revision.api.ids);
  app.get('/_api/revisions.list'      , accessTokenParser , loginRequired , revision.api.list);

  app.get('/trash$'                   , loginRequired , page.trashPageShowWrapper);
  app.get('/trash/$'                  , loginRequired , page.trashPageListShowWrapper);
  app.get('/trash/*/$'                , loginRequired , page.deletedPageListShowWrapper);

  app.get('/_hackmd/load-agent'          , hackmd.loadAgent);
  app.get('/_hackmd/load-styles'         , hackmd.loadStyles);
  app.post('/_api/hackmd.integrate'      , accessTokenParser , loginRequiredStrictly , csrf, hackmd.validateForApi, hackmd.integrate);
  app.post('/_api/hackmd.discard'        , accessTokenParser , loginRequiredStrictly , csrf, hackmd.validateForApi, hackmd.discard);
  app.post('/_api/hackmd.saveOnHackmd'   , accessTokenParser , loginRequiredStrictly , csrf, hackmd.validateForApi, hackmd.saveOnHackmd);

  app.get('/*/$'                   , loginRequired , page.showPageWithEndOfSlash, page.notFound);
  app.get('/*'                     , loginRequired , page.showPage, page.notFound);
};
