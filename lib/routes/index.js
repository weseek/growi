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
    , loginRequired = middleware.loginRequired
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
  app.post('/_api/admin/settings/fb'    , loginRequired(crowi, app) , middleware.adminRequired() , form.admin.fb
  , admin.api.appSetting);

  app.get('/admin/users'                , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.index);
  app.post('/admin/user/invite'         , form.admin.userInvite ,  loginRequired(crowi, app) , middleware.adminRequired() , admin.user.invite);
  app.post('/admin/user/:id/makeAdmin'  , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.makeAdmin);
  app.post('/admin/user/:id/removeFromAdmin', loginRequired(crowi, app) , middleware.adminRequired() , admin.user.removeFromAdmin);
  app.post('/admin/user/:id/activate'   , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.activate);
  app.post('/admin/user/:id/suspend'    , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.suspend);
  app.post('/admin/user/:id/remove'     , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.remove);
  app.post('/admin/user/:id/removeCompletely' , loginRequired(crowi, app) , middleware.adminRequired() , admin.user.removeCompletely);

  app.get('/me'                      , loginRequired(crowi, app) , me.index);
  app.get('/me/password'             , loginRequired(crowi, app) , me.password);
  app.post('/me'                     , form.me.user               , loginRequired(crowi, app) , me.index);
  app.post('/me/password'            , form.me.password           , loginRequired(crowi, app) , me.password);
  app.post('/me/picture/delete'      , loginRequired(crowi, app) , me.deletePicture);
  app.post('/me/auth/facebook'       , loginRequired(crowi, app) , me.authFacebook);
  app.post('/me/auth/google'         , loginRequired(crowi, app) , me.authGoogle);
  app.get('/me/auth/google/callback' , loginRequired(crowi, app) , me.authGoogleCallback);

  app.get('/:id([0-9a-z]{24})'       , loginRequired(crowi, app) , page.api.redirector);
  app.get('/_r/:id([0-9a-z]{24})'    , loginRequired(crowi, app) , page.api.redirector); // alias
  app.get('/_api/check_username'     , user.api.checkUsername);
  app.post('/_api/me/picture/upload' , loginRequired(crowi, app) , me.api.uploadPicture);
  app.get('/_api/user/bookmarks'     , loginRequired(crowi, app) , user.api.bookmarks);
  app.post('/_api/page_rename/*'     , loginRequired(crowi, app) , page.api.rename);
  app.post('/_api/page/:id/like'     , loginRequired(crowi, app) , page.api.like);
  app.post('/_api/page/:id/unlike'   , loginRequired(crowi, app) , page.api.unlike);
  app.get('/_api/page/:id/bookmark'  , loginRequired(crowi, app) , page.api.isBookmarked);
  app.post('/_api/page/:id/bookmark' , loginRequired(crowi, app) , page.api.bookmark);
  //app.get('/_api/page/*'           , user.useUserData()         , page.api.get);
  //app.get('/_api/revision/:id'     , user.useUserData()         , revision.api.get);
  //app.get('/_api/r/:revisionId'    , user.useUserData()         , page.api.get);

  app.post('/*/edit'                 , form.revision              , loginRequired(crowi, app) , page.pageEdit);
  app.get('/*/$'                     , loginRequired(crowi, app) , page.pageListShow);
  app.get('/*'                       , loginRequired(crowi, app) , page.pageShow);
  //app.get('/*/edit'                , routes.edit);
};
