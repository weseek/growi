module.exports = function(crowi, app) {
  var middleware = require('../util/middlewares')
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
    , accessTokenParser = middleware.accessTokenParser
    ;

  app.get('/'                        , loginRequired(crowi, app) , page.pageListShow);

  app.get('/installer'               , middleware.applicationNotInstalled() , installer.index);
  app.post('/installer/createAdmin'  , middleware.applicationNotInstalled() , form.register , installer.createAdmin);
  //app.post('/installer/user'         , middleware.applicationNotInstalled() , installer.createFirstUser);

  app.get('/login/error/:reason'     , login.error);
  app.get('/login'                   , middleware.applicationInstalled()    , login.login);
  app.get('/login/invited'           , login.invited);
  app.post('/login/activateInvited'  , form.invited                         , login.invited);
  app.post('/login'                  , form.login                           , login.login);
  app.post('/register'               , form.register                        , login.register);
  app.get('/register'                , middleware.applicationInstalled()    , login.register);
  app.post('/register/google'        , login.registerGoogle);
  app.get('/google/callback'         , login.googleCallback);
  app.get('/login/google'            , login.loginGoogle);
  app.get('/login/facebook'          , login.loginFacebook);
  app.get('/logout'                  , logout.logout);

  app.get('/admin'                      , loginRequired(crowi, app) , middleware.adminRequired() , admin.index);
  app.get('/admin/app'                  , loginRequired(crowi, app) , middleware.adminRequired() , admin.app.index);
  app.post('/_api/admin/settings/app'   , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.app, admin.api.appSetting);
  app.post('/_api/admin/settings/sec'   , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.sec, admin.api.appSetting);
  app.post('/_api/admin/settings/mail'  , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.mail, admin.api.appSetting);
  app.post('/_api/admin/settings/aws'   , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.aws, admin.api.appSetting);
  app.post('/_api/admin/settings/google', loginRequired(crowi, app) , middleware.adminRequired() , form.admin.google, admin.api.appSetting);
  app.post('/_api/admin/settings/fb'    , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.fb , admin.api.appSetting);

  // search admin
  app.get('/admin/search'              , loginRequired(crowi, app) , middleware.adminRequired() , admin.search.index);
  app.post('/admin/search/build'       , loginRequired(crowi, app) , middleware.adminRequired() , admin.search.buildIndex);

  // notification admin
  app.get('/admin/notification'              , loginRequired(crowi, app) , middleware.adminRequired() , admin.notification.index);
  app.post('/admin/notification/slackSetting', loginRequired(crowi, app) , middleware.adminRequired() , form.admin.slackSetting, admin.notification.slackSetting);
  app.get('/admin/notification/slackAuth'    , loginRequired(crowi, app) , middleware.adminRequired() , admin.notification.slackAuth);
  app.post('/_api/admin/notification.add'    , loginRequired(crowi, app) , middleware.adminRequired() , admin.api.notificationAdd);
  app.post('/_api/admin/notification.remove' , loginRequired(crowi, app) , middleware.adminRequired() , admin.api.notificationRemove);

  app.get('/admin/users'                , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.index);
  app.post('/admin/user/invite'         , form.admin.userInvite ,  loginRequired(crowi, app) , middleware.adminRequired() , admin.user.invite);
  app.post('/admin/user/:id/makeAdmin'  , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.makeAdmin);
  app.post('/admin/user/:id/removeFromAdmin', loginRequired(crowi, app) , middleware.adminRequired() , admin.user.removeFromAdmin);
  app.post('/admin/user/:id/activate'   , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.activate);
  app.post('/admin/user/:id/suspend'    , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.suspend);
  app.post('/admin/user/:id/remove'     , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.remove);
  app.post('/admin/user/:id/removeCompletely' , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.removeCompletely);

  app.get('/me'                       , loginRequired(crowi, app) , me.index);
  app.get('/me/password'              , loginRequired(crowi, app) , me.password);
  app.get('/me/apiToken'              , loginRequired(crowi, app) , me.apiToken);
  app.post('/me'                      , form.me.user              , loginRequired(crowi, app) , me.index);
  app.post('/me/password'             , form.me.password          , loginRequired(crowi, app) , me.password);
  app.post('/me/apiToken'             , form.me.apiToken          , loginRequired(crowi, app) , me.apiToken);
  app.post('/me/picture/delete'       , loginRequired(crowi, app) , me.deletePicture);
  app.post('/me/auth/facebook'        , loginRequired(crowi, app) , me.authFacebook);
  app.post('/me/auth/google'          , loginRequired(crowi, app) , me.authGoogle);
  app.get( '/me/auth/google/callback' , loginRequired(crowi, app) , me.authGoogleCallback);

  app.get( '/:id([0-9a-z]{24})'       , loginRequired(crowi, app) , page.api.redirector);
  app.get( '/_r/:id([0-9a-z]{24})'    , loginRequired(crowi, app) , page.api.redirector); // alias

  app.get( '/_search'                 , loginRequired(crowi, app) , search.searchPage);
  app.get( '/_api/search'             , accessTokenParser(crowi, app) , loginRequired(crowi, app) , search.api.search);

  app.get( '/_api/check_username'     , user.api.checkUsername);
  app.post('/_api/me/picture/upload'  , loginRequired(crowi, app) , me.api.uploadPicture);
  app.get( '/_api/user/bookmarks'     , loginRequired(crowi, app) , user.api.bookmarks);
  app.get( '/_api/attachment/page/:pageId', loginRequired(crowi, app) , attachment.api.list);
  app.post('/_api/attachment/page/:pageId', loginRequired(crowi, app) , attachment.api.add);
  app.post('/_api/attachment/:id/remove',loginRequired(crowi, app), attachment.api.remove);

  app.get( '/user/:username([^/]+)/bookmarks'      , loginRequired(crowi, app) , page.userBookmarkList);
  app.get( '/user/:username([^/]+)/recent-create'  , loginRequired(crowi, app) , page.userRecentCreatedList);

  // HTTP RPC Styled API (に徐々に移行していいこうと思う)
  app.get('/_api/users.list'          , accessTokenParser(crowi, app) , loginRequired(crowi, app) , user.api.list);
  app.get('/_api/pages.get'           , accessTokenParser(crowi, app) , loginRequired(crowi, app) , page.api.get);
  app.get('/_api/pages.updatePost'    , accessTokenParser(crowi, app) , loginRequired(crowi, app) , page.api.getUpdatePost);
  app.post('/_api/pages.seen'         , accessTokenParser(crowi, app) , loginRequired(crowi, app) , page.api.seen);
  app.post('/_api/pages.rename'       , accessTokenParser(crowi, app) , loginRequired(crowi, app) , page.api.rename);
  app.get('/_api/comments.get'        , accessTokenParser(crowi, app) , loginRequired(crowi, app) , comment.api.get);
  app.post('/_api/comments.add'       , form.comment, accessTokenParser(crowi, app) , loginRequired(crowi, app) , comment.api.add);
  app.get( '/_api/bookmarks.get'      , accessTokenParser(crowi, app) , loginRequired(crowi, app) , bookmark.api.get);
  app.post('/_api/bookmarks.add'      , accessTokenParser(crowi, app) , loginRequired(crowi, app) , bookmark.api.add);
  app.post('/_api/bookmarks.remove'   , accessTokenParser(crowi, app) , loginRequired(crowi, app) , bookmark.api.remove);
  app.post('/_api/likes.add'          , accessTokenParser(crowi, app) , loginRequired(crowi, app) , page.api.like);
  app.post('/_api/likes.remove'       , accessTokenParser(crowi, app) , loginRequired(crowi, app) , page.api.unlike);

  app.get( '/_api/revisions.get'      , accessTokenParser(crowi, app) , loginRequired(crowi, app) , revision.api.get);
  app.get( '/_api/revisions.list'     , accessTokenParser(crowi, app) , loginRequired(crowi, app) ,revision.api.list);

  //app.get('/_api/revision/:id'     , user.useUserData()         , revision.api.get);
  //app.get('/_api/r/:revisionId'    , user.useUserData()         , page.api.get);

  app.post('/_/edit'                 , form.revision             , loginRequired(crowi, app) , page.pageEdit);
  app.get('/*/$'                     , loginRequired(crowi, app) , page.pageListShow);
  app.get('/*'                       , loginRequired(crowi, app) , page.pageShow);
  //app.get('/*/edit'                , routes.edit);
};
