const multer = require('multer');
const autoReap = require('multer-autoreap');

autoReap.options.reapOnError = true; // continue reaping the file even if an error occurs

module.exports = function(crowi, app) {
  const applicationNotInstalled = require('../middlewares/application-not-installed')(crowi);
  const applicationInstalled = require('../middlewares/application-installed')(crowi);
  const accessTokenParser = require('../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../middlewares/login-required')(crowi);
  const loginRequired = require('../middlewares/login-required')(crowi, true);
  const adminRequired = require('../middlewares/admin-required')(crowi);
  const certifySharedFile = require('../middlewares/certify-shared-file')(crowi);
  const csrf = require('../middlewares/csrf')(crowi);

  const uploads = multer({ dest: `${crowi.tmpDir}uploads` });
  const form = require('../form');
  const page = require('./page')(crowi, app);
  const login = require('./login')(crowi, app);
  const loginPassport = require('./login-passport')(crowi, app);
  const logout = require('./logout')(crowi, app);
  const me = require('./me')(crowi, app);
  const admin = require('./admin')(crowi, app);
  const user = require('./user')(crowi, app);
  const attachment = require('./attachment')(crowi, app);
  const comment = require('./comment')(crowi, app);
  const tag = require('./tag')(crowi, app);
  const search = require('./search')(crowi, app);
  const hackmd = require('./hackmd')(crowi, app);

  const isInstalled = crowi.configManager.getConfig('crowi', 'app:installed');

  /* eslint-disable max-len, comma-spacing, no-multi-spaces */

  app.get('/'                        , applicationInstalled, loginRequired , page.showTopPage);

  // API v3
  app.use('/api-docs', require('./apiv3/docs')(crowi));
  app.use('/_api/v3', require('./apiv3')(crowi));

  // installer
  if (!isInstalled) {
    const installer = require('./installer')(crowi);
    app.get('/installer'               , applicationNotInstalled , installer.index);
    app.post('/installer'              , applicationNotInstalled , form.register , csrf, installer.install);
    return;
  }

  app.get('/login/error/:reason'     , login.error);
  app.get('/login'                   , applicationInstalled     , login.preLogin, login.login);
  app.get('/login/invited'           , login.invited);
  app.post('/login/activateInvited'  , form.invited                         , csrf, login.invited);
  app.post('/login'                  , form.login                           , csrf, loginPassport.loginWithLocal, loginPassport.loginWithLdap, loginPassport.loginFailure);
  app.post('/_api/login/testLdap'    , loginRequiredStrictly , form.login , loginPassport.testLdapCredentials);

  app.post('/register'               , form.register                        , csrf, login.register);
  app.get('/register'                , applicationInstalled     , login.preLogin, login.register);
  app.get('/logout'                  , logout.logout);

  app.get('/admin'                          , loginRequiredStrictly , adminRequired , admin.index);
  app.get('/admin/app'                      , loginRequiredStrictly , adminRequired , admin.app.index);

  // security admin
  app.get('/admin/security'                     , loginRequiredStrictly , adminRequired , admin.security.index);

  // OAuth
  app.get('/passport/google'                      , loginPassport.loginWithGoogle, loginPassport.loginFailure);
  app.get('/passport/github'                      , loginPassport.loginWithGitHub, loginPassport.loginFailure);
  app.get('/passport/twitter'                     , loginPassport.loginWithTwitter, loginPassport.loginFailure);
  app.get('/passport/oidc'                        , loginPassport.loginWithOidc, loginPassport.loginFailure);
  app.get('/passport/saml'                        , loginPassport.loginWithSaml, loginPassport.loginFailure);
  app.get('/passport/basic'                       , loginPassport.loginWithBasic, loginPassport.loginFailure);
  app.get('/passport/google/callback'             , loginPassport.loginPassportGoogleCallback   , loginPassport.loginFailure);
  app.get('/passport/github/callback'             , loginPassport.loginPassportGitHubCallback   , loginPassport.loginFailure);
  app.get('/passport/twitter/callback'            , loginPassport.loginPassportTwitterCallback  , loginPassport.loginFailure);
  app.get('/passport/oidc/callback'               , loginPassport.loginPassportOidcCallback     , loginPassport.loginFailure);
  app.post('/passport/saml/callback'              , loginPassport.loginPassportSamlCallback     , loginPassport.loginFailure);

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
  app.get('/admin/global-notification/new'   , loginRequiredStrictly , adminRequired , admin.globalNotification.detail);
  app.get('/admin/global-notification/:id'   , loginRequiredStrictly , adminRequired , admin.globalNotification.detail);

  app.get('/admin/users'                , loginRequiredStrictly , adminRequired , admin.user.index);

  app.get('/admin/users/external-accounts'               , loginRequiredStrictly , adminRequired , admin.externalAccount.index);

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
  // external-accounts
  app.get('/me/external-accounts'                         , loginRequiredStrictly , me.externalAccounts.list);
  // my drafts
  app.get('/me/drafts'                , loginRequiredStrictly, me.drafts.list);

  app.get('/:id([0-9a-z]{24})'       , loginRequired , page.redirector);
  app.get('/_r/:id([0-9a-z]{24})'    , loginRequired , page.redirector); // alias
  app.get('/attachment/:id([0-9a-z]{24})' , certifySharedFile , loginRequired, attachment.api.get);
  app.get('/attachment/profile/:id([0-9a-z]{24})' , loginRequired, attachment.api.get);
  app.get('/attachment/:pageId/:fileName', loginRequired, attachment.api.obsoletedGetForMongoDB); // DEPRECATED: remains for backward compatibility for v3.3.x or below
  app.get('/download/:id([0-9a-z]{24})'    , loginRequired, attachment.api.download);

  app.get('/_search'                 , loginRequired , search.searchPage);
  app.get('/_api/search'             , accessTokenParser , loginRequired , search.api.search);

  app.get('/_api/check_username'           , user.api.checkUsername);
  app.get('/_api/me/user-group-relations'  , accessTokenParser , loginRequiredStrictly , me.api.userGroupRelations);
  app.get('/_api/user/bookmarks'           , loginRequired , user.api.bookmarks);

  // HTTP RPC Styled API (に徐々に移行していいこうと思う)
  app.get('/_api/users.list'          , accessTokenParser , loginRequired , user.api.list);
  app.get('/_api/pages.list'          , accessTokenParser , loginRequired , page.api.list);
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
  app.post('/_api/attachments.add'                  , uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly ,csrf, attachment.api.add);
  app.post('/_api/attachments.uploadProfileImage'   , uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly ,csrf, attachment.api.uploadProfileImage);
  app.post('/_api/attachments.remove'               , accessTokenParser , loginRequiredStrictly , csrf, attachment.api.remove);
  app.post('/_api/attachments.removeProfileImage'   , accessTokenParser , loginRequiredStrictly , csrf, attachment.api.removeProfileImage);
  app.get('/_api/attachments.limit'   , accessTokenParser , loginRequiredStrictly, attachment.api.limit);

  app.get('/trash$'                   , loginRequired , page.trashPageShowWrapper);
  app.get('/trash/$'                  , loginRequired , page.trashPageListShowWrapper);
  app.get('/trash/*/$'                , loginRequired , page.deletedPageListShowWrapper);

  app.get('/_hackmd/load-agent'          , hackmd.loadAgent);
  app.get('/_hackmd/load-styles'         , hackmd.loadStyles);
  app.post('/_api/hackmd.integrate'      , accessTokenParser , loginRequiredStrictly , csrf, hackmd.validateForApi, hackmd.integrate);
  app.post('/_api/hackmd.discard'        , accessTokenParser , loginRequiredStrictly , csrf, hackmd.validateForApi, hackmd.discard);
  app.post('/_api/hackmd.saveOnHackmd'   , accessTokenParser , loginRequiredStrictly , csrf, hackmd.validateForApi, hackmd.saveOnHackmd);

  app.get('/share/:linkId', page.showSharedPage);

  app.get('/*/$'                   , loginRequired , page.showPageWithEndOfSlash, page.notFound);
  app.get('/*'                     , loginRequired , page.showPage, page.notFound);

};
