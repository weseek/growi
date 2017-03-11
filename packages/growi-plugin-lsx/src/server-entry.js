export default (crowi, app) => {
  // add routes
  require('./lib/routes')(crowi, app);

  // add interceptor for Server Side Rendering
  const LsxBeforeRenderPageInterceptor = require('./lib/util/LsxBeforeRenderPageInterceptor');
  crowi.getInterceptorManager()
      .addInterceptor(new LsxBeforeRenderPageInterceptor());
}
