import csrf from 'csurf';
import express from 'express';

import { generateAddActivityMiddleware } from '../middlewares/add-activity';
import apiV1FormValidator from '../middlewares/apiv1-form-validator';
import injectResetOrderByTokenMiddleware from '../middlewares/inject-reset-order-by-token-middleware';
import injectUserRegistrationOrderByTokenMiddleware from '../middlewares/inject-user-registration-order-by-token-middleware';
import * as loginFormValidator from '../middlewares/login-form-validator';
import * as registerFormValidator from '../middlewares/register-form-validator';
import {
  generateUnavailableWhenMaintenanceModeMiddleware, generateUnavailableWhenMaintenanceModeMiddlewareForApi,
} from '../middlewares/unavailable-when-maintenance-mode';

import * as allInAppNotifications from './all-in-app-notifications';
import * as forgotPassword from './forgot-password';
import nextFactory from './next';
import * as privateLegacyPages from './private-legacy-pages';
import * as userActivation from './user-activation';

const multer = require('multer');
const autoReap = require('multer-autoreap');

const csrfProtection = csrf({ cookie: false });

autoReap.options.reapOnError = true; // continue reaping the file even if an error occurs

module.exports = function(crowi, app) {
  const autoReconnectToSearch = require('../middlewares/auto-reconnect-to-search')(crowi);
  const applicationNotInstalled = require('../middlewares/application-not-installed')(crowi);
  const applicationInstalled = require('../middlewares/application-installed')(crowi);
  const accessTokenParser = require('../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../middlewares/login-required')(crowi);
  const loginRequired = require('../middlewares/login-required')(crowi, true);
  const adminRequired = require('../middlewares/admin-required')(crowi);
  const certifySharedFile = require('../middlewares/certify-shared-file')(crowi);
  const injectUserUISettings = require('../middlewares/inject-user-ui-settings-to-localvars')();
  const rateLimiter = require('../middlewares/rate-limiter')();
  const addActivity = generateAddActivityMiddleware(crowi);

  const uploads = multer({ dest: `${crowi.tmpDir}uploads` });
  const page = require('./page')(crowi, app);
  const login = require('./login')(crowi, app);
  const loginPassport = require('./login-passport')(crowi, app);
  const me = require('./me')(crowi, app);
  const admin = require('./admin')(crowi, app);
  const user = require('./user')(crowi, app);
  const attachment = require('./attachment')(crowi, app);
  const comment = require('./comment')(crowi, app);
  const tag = require('./tag')(crowi, app);
  const search = require('./search')(crowi, app);
  const hackmd = require('./hackmd')(crowi, app);
  const ogp = require('./ogp')(crowi);

  const next = nextFactory(crowi);

  const unavailableWhenMaintenanceMode = generateUnavailableWhenMaintenanceModeMiddleware(crowi);
  const unavailableWhenMaintenanceModeForApi = generateUnavailableWhenMaintenanceModeMiddlewareForApi(crowi);

  const isInstalled = crowi.configManager.getConfig('crowi', 'app:installed');

  /* eslint-disable max-len, comma-spacing, no-multi-spaces */

  const [apiV3Router, apiV3AdminRouter, apiV3AuthRouter] = require('./apiv3')(crowi, app, isInstalled);

  app.use('/api-docs', require('./apiv3/docs')(crowi, app));

  // Rate limiter
  app.use(rateLimiter);

  // API v3 for admin
  app.use('/_api/v3', apiV3AdminRouter);

  // API v3 for auth
  app.use('/_api/v3', apiV3AuthRouter);

  app.get('/_next/*'                  , next.delegateToNext);

  app.get('/'                         , applicationInstalled, unavailableWhenMaintenanceMode, loginRequired, autoReconnectToSearch, next.delegateToNext);

  app.get('/login/error/:reason'      , applicationInstalled, login.error);
  app.get('/login'                    , applicationInstalled, login.preLogin, next.delegateToNext);
  app.get('/invited'                  , applicationInstalled, next.delegateToNext);
  // app.post('/login'                   , applicationInstalled, loginFormValidator.loginRules(), loginFormValidator.loginValidation, csrfProtection,  addActivity, loginPassport.loginWithLocal, loginPassport.loginWithLdap, loginPassport.loginFailure);

  app.get('/register'                 , applicationInstalled, login.preLogin, login.register);

  // load before "/admin/*"
  app.get('/admin/export/:fileName'             , loginRequiredStrictly , adminRequired ,admin.export.api.validators.export.download(), admin.export.download);

  app.get('/admin/*'                    , applicationInstalled, loginRequiredStrictly , adminRequired , next.delegateToNext);
  app.get('/admin'                    , applicationInstalled, loginRequiredStrictly , adminRequired , next.delegateToNext);
  // app.get('/admin/app'                , applicationInstalled, loginRequiredStrictly , adminRequired , admin.app.index);

  // installer
  if (!isInstalled) {
    app.get('/installer'              , applicationNotInstalled, next.delegateToNext);
    return;
  }

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
  app.post('/passport/saml/callback'              , addActivity, loginPassport.loginPassportSamlCallback, loginPassport.loginFailure);

  app.post('/_api/login/testLdap'    , loginRequiredStrictly , loginFormValidator.loginRules() , loginFormValidator.loginValidation , loginPassport.testLdapCredentials);

  // security admin
  // app.get('/admin/security'          , loginRequiredStrictly , adminRequired , admin.security.index);

  // markdown admin
  // app.get('/admin/markdown'          , loginRequiredStrictly , adminRequired , admin.markdown.index);

  // customize admin
  // app.get('/admin/customize'         , loginRequiredStrictly , adminRequired , admin.customize.index);

  // search admin
  // app.get('/admin/search'            , loginRequiredStrictly , adminRequired , admin.search.index);

  // notification admin
  // app.get('/admin/notification'                         , loginRequiredStrictly , adminRequired , admin.notification.index);
  // app.get('/admin/notification/slackAuth'               , loginRequiredStrictly , adminRequired , admin.notification.slackAuth);
  // app.get('/admin/notification/slackSetting/disconnect' , loginRequiredStrictly , adminRequired , admin.notification.disconnectFromSlack);
  // app.get('/admin/global-notification/new'              , loginRequiredStrictly , adminRequired , admin.globalNotification.detail);
  // app.get('/admin/global-notification/:id'              , loginRequiredStrictly , adminRequired , admin.globalNotification.detail);
  // app.get('/admin/slack-integration-legacy'             , loginRequiredStrictly , adminRequired,  admin.slackIntegrationLegacy);
  // app.get('/admin/slack-integration'                    , loginRequiredStrictly , adminRequired,  admin.slackIntegration);

  // app.get('/admin/users'                                , loginRequiredStrictly , adminRequired , admin.user.index);

  // app.get('/admin/users/external-accounts'              , loginRequiredStrictly , adminRequired , admin.externalAccount.index);

  // user-groups admin
  // app.get('/admin/user-groups'                          , loginRequiredStrictly, adminRequired, admin.userGroup.index);
  // app.get('/admin/user-group-detail/:id'                , loginRequiredStrictly, adminRequired, admin.userGroup.detail);

  // auditLog admin
  // app.get('/admin/audit-log'                            , loginRequiredStrictly, adminRequired, admin.auditLog.index);

  // importer management for admin
  // app.get('/admin/importer'                     , loginRequiredStrictly , adminRequired , admin.importer.index);
  app.post('/_api/admin/settings/importerEsa'   , loginRequiredStrictly , adminRequired , csrfProtection, addActivity, admin.importer.api.validators.importer.esa(),admin.api.importerSettingEsa);
  app.post('/_api/admin/settings/importerQiita' , loginRequiredStrictly , adminRequired , csrfProtection, addActivity, admin.importer.api.validators.importer.qiita(), admin.api.importerSettingQiita);
  app.post('/_api/admin/import/esa'             , loginRequiredStrictly , adminRequired , csrfProtection, addActivity, admin.api.importDataFromEsa);
  app.post('/_api/admin/import/testEsaAPI'      , loginRequiredStrictly , adminRequired , csrfProtection, addActivity, admin.api.testEsaAPI);
  app.post('/_api/admin/import/qiita'           , loginRequiredStrictly , adminRequired , csrfProtection, addActivity, admin.api.importDataFromQiita);
  app.post('/_api/admin/import/testQiitaAPI'    , loginRequiredStrictly , adminRequired , csrfProtection, addActivity, admin.api.testQiitaAPI);

  // export management for admin
  // app.get('/admin/export'                       , loginRequiredStrictly , adminRequired ,admin.export.index);

  // app.get('/admin/*'                            , loginRequiredStrictly ,adminRequired, admin.notFound.index);

  /*
   * Routes below are unavailable when maintenance mode
   */

  // API v3
  app.use('/_api/v3', unavailableWhenMaintenanceModeForApi, apiV3Router);

  const apiV1Router = express.Router();

  apiV1Router.get('/search'                        , accessTokenParser , loginRequired , search.api.search);

  apiV1Router.get('/me/user-group-relations'  , accessTokenParser , loginRequiredStrictly , me.api.userGroupRelations);

  // HTTP RPC Styled API (に徐々に移行していいこうと思う)
  apiV1Router.get('/pages.list'          , accessTokenParser , loginRequired , page.api.list);
  apiV1Router.post('/pages.update'       , accessTokenParser , loginRequiredStrictly , addActivity, page.api.update);
  apiV1Router.get('/pages.exist'         , accessTokenParser , loginRequired , page.api.exist);
  apiV1Router.get('/pages.updatePost'    , accessTokenParser, loginRequired, page.api.getUpdatePost);
  apiV1Router.get('/pages.getPageTag'    , accessTokenParser , loginRequired , page.api.getPageTag);
  // allow posting to guests because the client doesn't know whether the user logged in
  apiV1Router.post('/pages.remove'       , loginRequiredStrictly , page.validator.remove, apiV1FormValidator, page.api.remove); // (Avoid from API Token)
  apiV1Router.post('/pages.revertRemove' , loginRequiredStrictly , page.validator.revertRemove, apiV1FormValidator, page.api.revertRemove); // (Avoid from API Token)
  apiV1Router.post('/pages.unlink'       , loginRequiredStrictly , page.api.unlink); // (Avoid from API Token)
  apiV1Router.post('/pages.duplicate'    , accessTokenParser, loginRequiredStrictly, page.api.duplicate);
  apiV1Router.get('/tags.list'           , accessTokenParser, loginRequired, tag.api.list);
  apiV1Router.get('/tags.search'         , accessTokenParser, loginRequired, tag.api.search);
  apiV1Router.post('/tags.update'        , accessTokenParser, loginRequiredStrictly, addActivity, tag.api.update);
  apiV1Router.get('/comments.get'        , accessTokenParser , loginRequired , comment.api.get);
  apiV1Router.post('/comments.add'       , comment.api.validators.add(), accessTokenParser , loginRequiredStrictly , addActivity, comment.api.add);
  apiV1Router.post('/comments.update'    , comment.api.validators.add(), accessTokenParser , loginRequiredStrictly , addActivity, comment.api.update);
  apiV1Router.post('/comments.remove'    , accessTokenParser , loginRequiredStrictly , addActivity, comment.api.remove);

  apiV1Router.post('/attachments.add'                  , uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly ,addActivity ,attachment.api.add);
  apiV1Router.post('/attachments.uploadProfileImage'   , uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly ,attachment.api.uploadProfileImage);
  apiV1Router.post('/attachments.remove'               , accessTokenParser , loginRequiredStrictly , addActivity ,attachment.api.remove);
  apiV1Router.post('/attachments.removeProfileImage'   , accessTokenParser , loginRequiredStrictly , attachment.api.removeProfileImage);
  apiV1Router.get('/attachments.limit'   , accessTokenParser , loginRequiredStrictly, attachment.api.limit);

  // API v1
  app.use('/_api', unavailableWhenMaintenanceModeForApi, apiV1Router);

  app.use(unavailableWhenMaintenanceMode);

  // app.get('/tags'                     , loginRequired, tag.showPage);
  app.get('/tags', loginRequired, next.delegateToNext);

  app.get('/me'                                 , loginRequiredStrictly, injectUserUISettings, next.delegateToNext);
  app.get('/me/*'                                 , loginRequiredStrictly, injectUserUISettings, next.delegateToNext);
  // external-accounts
  // my in-app-notifications
  // app.get('/me/all-in-app-notifications'   , loginRequiredStrictly, injectUserUISettings, allInAppNotifications.list);
  // app.get('/me/external-accounts'               , loginRequiredStrictly, injectUserUISettings, me.externalAccounts.list);
  // // my drafts
  // app.get('/me/drafts'                          , loginRequiredStrictly, injectUserUISettings, me.drafts.list);

  app.get('/attachment/:id([0-9a-z]{24})' , certifySharedFile , loginRequired, attachment.api.get);
  app.get('/attachment/profile/:id([0-9a-z]{24})' , loginRequired, attachment.api.get);
  app.get('/attachment/:pageId/:fileName'       , loginRequired, attachment.api.obsoletedGetForMongoDB); // DEPRECATED: remains for backward compatibility for v3.3.x or below
  app.get('/download/:id([0-9a-z]{24})'         , loginRequired, attachment.api.download);

  app.get('/_search'                            , loginRequired, next.delegateToNext);

  app.get('/trash$'                   , loginRequired, injectUserUISettings, next.delegateToNext);
  app.get('/trash/$'                  , loginRequired, (req, res) => res.redirect('/trash'));
  app.get('/trash/*/$'                , loginRequired, injectUserUISettings, page.deletedPageListShowWrapper);

  app.get('/_hackmd/load-agent'          , hackmd.loadAgent);
  app.get('/_hackmd/load-styles'         , hackmd.loadStyles);
  app.post('/_api/hackmd.integrate'      , accessTokenParser , loginRequiredStrictly , hackmd.validateForApi, hackmd.integrate);
  app.post('/_api/hackmd.discard'        , accessTokenParser , loginRequiredStrictly , hackmd.validateForApi, hackmd.discard);
  app.post('/_api/hackmd.saveOnHackmd'   , accessTokenParser , loginRequiredStrictly , hackmd.validateForApi, hackmd.saveOnHackmd);

  app.use('/forgot-password', express.Router()
    .use(forgotPassword.checkForgotPasswordEnabledMiddlewareFactory(crowi))
    .get('/', forgotPassword.renderForgotPassword(crowi))
    .get('/:token', injectResetOrderByTokenMiddleware, forgotPassword.renderResetPassword(crowi))
    .use(forgotPassword.handleErrorsMiddleware(crowi)));

  app.get('/_private-legacy-pages', next.delegateToNext);
  app.use('/user-activation', express.Router()
    .get('/:token', applicationInstalled, injectUserRegistrationOrderByTokenMiddleware, userActivation.form)
    .use(userActivation.tokenErrorHandlerMiddeware));
  app.post('/user-activation/register', applicationInstalled, csrfProtection, userActivation.registerRules(), userActivation.validateRegisterForm, userActivation.registerAction(crowi));

  app.get('/share/:linkId', next.delegateToNext);

  app.use('/ogp', express.Router().get('/:pageId([0-9a-z]{0,})', loginRequired, ogp.pageIdRequired, ogp.ogpValidator, ogp.renderOgp));

  app.get('/*/$'                   , loginRequired, next.delegateToNext);
  app.get('/*'                     , loginRequired, autoReconnectToSearch, next.delegateToNext);

};
