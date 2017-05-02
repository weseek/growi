module.exports = function(crowi, app) {
  var middleware = require('../util/middlewares')
    , multer    = require('multer')
    , uploads   = multer({dest: crowi.tmpDir + 'uploads'})
    , form      = require('../form')
    , page      = require('./page')(crowi, app)
    , login     = require('./login')(crowi, app)
    , logout    = require('./logout')(crowi, app)
    , me        = require('./me')(crowi, app)
    , admin     = require('./admin')(crowi, app)
    , installer = require('./installer')(crowi, app)
    , user      = require('./user')(crowi, app)
    , attachment= require('./attachment')(crowi, app)
    , comment   = require('./comment')(crowi, app)
    , bookmark  = require('./bookmark')(crowi, app)
    , revision  = require('./revision')(crowi, app)
    , search    = require('./search')(crowi, app)
    , loginRequired = middleware.loginRequired
    , accessTokenParser = middleware.accessTokenParser(crowi, app)
    , csrf      = middleware.csrfVerify(crowi, app)
    ;

  app.get('/'                        , loginRequired(crowi, app) , page.pageListShow);

  app.get('/installer'               , middleware.applicationNotInstalled() , installer.index);
  app.post('/installer/createAdmin'  , middleware.applicationNotInstalled() , form.register , csrf, installer.createAdmin);
  //app.post('/installer/user'         , middleware.applicationNotInstalled() , installer.createFirstUser);

  app.get('/login/error/:reason'     , login.error);
  app.get('/login'                   , middleware.applicationInstalled()    , login.login);
  app.get('/login/invited'           , login.invited);
  app.post('/login/activateInvited'  , form.invited                         , csrf, login.invited);
  app.post('/login'                  , form.login                           , csrf, login.login);
  app.post('/register'               , form.register                        , csrf, login.register);
  app.get('/register'                , middleware.applicationInstalled()    , login.register);
  app.post('/register/google'        , login.registerGoogle);
  app.get('/google/callback'         , login.googleCallback);
  app.get('/login/google'            , login.loginGoogle);
  app.get('/logout'                  , logout.logout);

  app.get('/admin'                      , loginRequired(crowi, app) , middleware.adminRequired() , admin.index);
  app.get('/admin/app'                  , loginRequired(crowi, app) , middleware.adminRequired() , admin.app.index);
  app.post('/_api/admin/settings/app'   , loginRequired(crowi, app) , middleware.adminRequired() , csrf, form.admin.app, admin.api.appSetting);
  app.post('/_api/admin/settings/sec'   , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.sec, admin.api.appSetting);
  app.post('/_api/admin/settings/mail'  , loginRequired(crowi, app) , middleware.adminRequired() , csrf, form.admin.mail, admin.api.appSetting);
  app.post('/_api/admin/settings/aws'   , loginRequired(crowi, app) , middleware.adminRequired() , csrf, form.admin.aws, admin.api.appSetting);
  app.post('/_api/admin/settings/google', loginRequired(crowi, app) , middleware.adminRequired() , csrf, form.admin.google, admin.api.appSetting);

  // search admin
  app.get('/admin/search'              , loginRequired(crowi, app) , middleware.adminRequired() , admin.search.index);
  app.post('/admin/search/build'       , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.search.buildIndex);

  // notification admin
  app.get('/admin/notification'              , loginRequired(crowi, app) , middleware.adminRequired() , admin.notification.index);
  app.post('/admin/notification/slackSetting', loginRequired(crowi, app) , middleware.adminRequired() , csrf, form.admin.slackSetting, admin.notification.slackSetting);
  app.get('/admin/notification/slackAuth'    , loginRequired(crowi, app) , middleware.adminRequired() , admin.notification.slackAuth);
  app.post('/_api/admin/notification.add'    , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.api.notificationAdd);
  app.post('/_api/admin/notification.remove' , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.api.notificationRemove);
  app.get('/_api/admin/users.search'         , loginRequired(crowi, app) , middleware.adminRequired() , admin.api.usersSearch);

  app.get('/admin/users'                , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.index);
  app.post('/admin/user/invite'         , form.admin.userInvite ,  loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.invite);
  app.post('/admin/user/:id/makeAdmin'  , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.makeAdmin);
  app.post('/admin/user/:id/removeFromAdmin', loginRequired(crowi, app) , middleware.adminRequired() , admin.user.removeFromAdmin);
  app.post('/admin/user/:id/activate'   , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.activate);
  app.post('/admin/user/:id/suspend'    , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.suspend);
  app.post('/admin/user/:id/remove'     , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.remove);
  app.post('/admin/user/:id/removeCompletely' , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.removeCompletely);
  // new route patterns from here:
  app.post('/_api/admin/users.resetPassword'  , loginRequired(crowi, app) , middleware.adminRequired() , csrf, admin.user.resetPassword);

  app.get('/me'                       , loginRequired(crowi, app) , me.index);
  app.get('/me/password'              , loginRequired(crowi, app) , me.password);
  app.get('/me/apiToken'              , loginRequired(crowi, app) , me.apiToken);
  app.post('/me'                      , form.me.user              , loginRequired(crowi, app) , me.index);
  app.post('/me/password'             , form.me.password          , loginRequired(crowi, app) , me.password);
  app.post('/me/apiToken'             , form.me.apiToken          , loginRequired(crowi, app) , me.apiToken);
  app.post('/me/picture/delete'       , loginRequired(crowi, app) , me.deletePicture);
  app.post('/me/auth/google'          , loginRequired(crowi, app) , me.authGoogle);
  app.get( '/me/auth/google/callback' , loginRequired(crowi, app) , me.authGoogleCallback);

  app.get( '/:id([0-9a-z]{24})'       , loginRequired(crowi, app) , page.api.redirector);
  app.get( '/_r/:id([0-9a-z]{24})'    , loginRequired(crowi, app) , page.api.redirector); // alias
  app.get( '/files/:id([0-9a-z]{24})' , loginRequired(crowi, app) , attachment.api.redirector);

  app.get( '/_search'                 , loginRequired(crowi, app) , search.searchPage);
  app.get( '/_api/search'             , accessTokenParser , loginRequired(crowi, app) , search.api.search);

  app.get( '/_api/check_username'     , user.api.checkUsername);
  app.post('/_api/me/picture/upload'  , loginRequired(crowi, app) , uploads.single('userPicture'), me.api.uploadPicture);
  app.get( '/_api/user/bookmarks'     , loginRequired(crowi, app) , user.api.bookmarks);

  app.get( '/user/:username([^/]+)/bookmarks'      , loginRequired(crowi, app) , page.userBookmarkList);
  app.get( '/user/:username([^/]+)/recent-create'  , loginRequired(crowi, app) , page.userRecentCreatedList);

  // HTTP RPC Styled API (に徐々に移行していいこうと思う)
  app.get('/_api/users.list'          , accessTokenParser , loginRequired(crowi, app) , user.api.list);
  app.get('/_api/pages.list'          , accessTokenParser , loginRequired(crowi, app) , page.api.list);
  app.post('/_api/pages.create'       , accessTokenParser , loginRequired(crowi, app) , csrf, page.api.create);
  app.post('/_api/pages.update'       , accessTokenParser , loginRequired(crowi, app) , csrf, page.api.update);
  app.get('/_api/pages.get'           , accessTokenParser , loginRequired(crowi, app) , page.api.get);
  app.get('/_api/pages.updatePost'    , accessTokenParser , loginRequired(crowi, app) , page.api.getUpdatePost);
  app.post('/_api/pages.seen'         , accessTokenParser , loginRequired(crowi, app) , page.api.seen);
  app.post('/_api/pages.rename'       , accessTokenParser , loginRequired(crowi, app) , csrf, page.api.rename);
  app.post('/_api/pages.remove'       , loginRequired(crowi, app) , csrf, page.api.remove); // (Avoid from API Token)
  app.post('/_api/pages.revertRemove' , loginRequired(crowi, app) , csrf, page.api.revertRemove); // (Avoid from API Token)
  app.post('/_api/pages.unlink'       , loginRequired(crowi, app) , csrf, page.api.unlink); // (Avoid from API Token)
  app.get('/_api/comments.get'        , accessTokenParser , loginRequired(crowi, app) , comment.api.get);
  app.post('/_api/comments.add'       , form.comment, accessTokenParser , loginRequired(crowi, app) , csrf, comment.api.add);
  app.get( '/_api/bookmarks.get'      , accessTokenParser , loginRequired(crowi, app) , bookmark.api.get);
  app.post('/_api/bookmarks.add'      , accessTokenParser , loginRequired(crowi, app) , csrf, bookmark.api.add);
  app.post('/_api/bookmarks.remove'   , accessTokenParser , loginRequired(crowi, app) , csrf, bookmark.api.remove);
  app.post('/_api/likes.add'          , accessTokenParser , loginRequired(crowi, app) , csrf, page.api.like);
  app.post('/_api/likes.remove'       , accessTokenParser , loginRequired(crowi, app) , csrf, page.api.unlike);
  app.get( '/_api/attachments.list'   , accessTokenParser , loginRequired(crowi, app) , attachment.api.list);
  app.post('/_api/attachments.add'    , uploads.single('file'), accessTokenParser, loginRequired(crowi, app) ,csrf, attachment.api.add);
  app.post('/_api/attachments.remove' , accessTokenParser , loginRequired(crowi, app) , csrf, attachment.api.remove);

  app.get( '/_api/revisions.get'      , accessTokenParser , loginRequired(crowi, app) , revision.api.get);
  app.get( '/_api/revisions.ids'      , accessTokenParser , loginRequired(crowi, app) , revision.api.ids);
  app.get( '/_api/revisions.list'     , accessTokenParser , loginRequired(crowi, app) , revision.api.list);

  //app.get('/_api/revision/:id'     , user.useUserData()         , revision.api.get);
  //app.get('/_api/r/:revisionId'    , user.useUserData()         , page.api.get);

  app.post('/_/edit'                 , form.revision             , loginRequired(crowi, app) , csrf, page.pageEdit);
  app.get('/trash/$'                 , loginRequired(crowi, app) , page.deletedPageListShow);
  app.get('/trash/*/$'               , loginRequired(crowi, app) , page.deletedPageListShow);
  app.get('/*/$'                     , loginRequired(crowi, app) , page.pageListShow);
  app.get('/*'                       , loginRequired(crowi, app) , page.pageShow);

};
