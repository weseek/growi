module.exports = function(app) {
  var middleware = require('../lib/middlewares')
    , form      = require('../form')
    , page      = require('./page')(app)
    , login     = require('./login')(app)
    , logout    = require('./logout')(app)
    , me        = require('./me')(app)
    , admin     = require('./admin')(app)
    , installer = require('./installer')(app)
    , user      = require('./user')(app);

  app.get('/'                        , middleware.loginRequired() , page.pageListShow);

  app.get('/installer'               , middleware.applicationNotInstalled() , installer.index);
  app.post('/installer/createAdmin'  , middleware.applicationNotInstalled() , form.register , installer.createAdmin);
  //app.post('/installer/user'         , middleware.applicationNotInstalled() , installer.createFirstUser);

  app.get('/login'                   , middleware.applicationInstalled()    , login.login);
  app.post('/login'                  , form.login                           , login.login);
  app.post('/register'               , form.register                        , login.register);
  app.get('/register'                , middleware.applicationInstalled()    , login.register);
  app.post('/register/google'        , login.registerGoogle);
  app.get('/google/callback'         , login.googleCallback);
  app.get('/login/google'            , login.loginGoogle);
  app.get('/login/facebook'          , login.loginFacebook);
  app.get('/logout'                  , logout.logout);

  app.get('/admin'                      , middleware.loginRequired() , middleware.adminRequired() , admin.index);
  app.get('/admin/app'                  , middleware.loginRequired() , middleware.adminRequired() , admin.app.index);
  app.post('/_api/admin/settings/app'   , middleware.loginRequired() , middleware.adminRequired() , form.admin.app, admin.api.appSetting);
  app.post('/_api/admin/settings/sec'   , middleware.loginRequired() , middleware.adminRequired() , form.admin.sec, admin.api.appSetting);
  app.post('/_api/admin/settings/aws'   , middleware.loginRequired() , middleware.adminRequired() , form.admin.aws, admin.api.appSetting);
  app.post('/_api/admin/settings/google', middleware.loginRequired() , middleware.adminRequired() , form.admin.google, admin.api.appSetting);
  app.post('/_api/admin/settings/fb'    , middleware.loginRequired() , middleware.adminRequired() , form.admin.fb
  , admin.api.appSetting);

  app.get('/admin/users'                , middleware.loginRequired() , middleware.adminRequired() , admin.user.index);
  app.post('/admin/user/:id/makeAdmin'  , middleware.loginRequired() , middleware.adminRequired() , admin.user.makeAdmin);
  app.post('/admin/user/:id/removeFromAdmin', middleware.loginRequired() , middleware.adminRequired() , admin.user.removeFromAdmin);
  app.post('/admin/user/:id/activate'   , middleware.loginRequired() , middleware.adminRequired() , admin.user.activate);
  app.post('/admin/user/:id/suspend'    , middleware.loginRequired() , middleware.adminRequired() , admin.user.suspend);

  app.get('/me'                      , middleware.loginRequired() , me.index);
  app.get('/me/password'             , middleware.loginRequired() , me.password);
  app.post('/me'                     , form.me.user               , middleware.loginRequired() , me.index);
  app.post('/me/password'            , form.me.password           , middleware.loginRequired() , me.password);
  app.post('/me/picture/delete'      , middleware.loginRequired() , me.deletePicture);
  app.post('/me/auth/facebook'       , middleware.loginRequired() , me.authFacebook);
  app.post('/me/auth/google'         , middleware.loginRequired() , me.authGoogle);
  app.get('/me/auth/google/callback' , middleware.loginRequired() , me.authGoogleCallback);

  app.get('/_r/:id'                  , middleware.loginRequired() , page.api.redirector);
  app.get('/_api/check_username'     , user.api.checkUsername);
  app.post('/_api/me/picture/upload' , middleware.loginRequired() , me.api.uploadPicture);
  app.get('/_api/user/bookmarks'     , middleware.loginRequired() , user.api.bookmarks);
  app.post('/_api/page_rename/*'     , middleware.loginRequired() , page.api.rename);
  app.post('/_api/page/:id/like'     , middleware.loginRequired() , page.api.like);
  app.post('/_api/page/:id/unlike'   , middleware.loginRequired() , page.api.unlike);
  app.get('/_api/page/:id/bookmark'  , middleware.loginRequired() , page.api.isBookmarked);
  app.post('/_api/page/:id/bookmark' , middleware.loginRequired() , page.api.bookmark);
  //app.get('/_api/page/*'           , user.useUserData()         , page.api.get);
  //app.get('/_api/revision/:id'     , user.useUserData()         , revision.api.get);
  //app.get('/_api/r/:revisionId'    , user.useUserData()         , page.api.get);

  app.post('/*/edit'                 , form.revision              , middleware.loginRequired() , page.pageEdit);
  app.get('/*/$'                     , middleware.loginRequired() , page.pageListShow);
  app.get('/*'                       , middleware.loginRequired() , page.pageShow);
  //app.get('/*/edit'                , routes.edit);
};
