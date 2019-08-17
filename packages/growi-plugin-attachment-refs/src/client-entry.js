import PreRenderInterceptor from './client/js/util/Interceptor/PreRenderInterceptor';
import PostRenderInterceptor from './client/js/util/Interceptor/PostRenderInterceptor';

export default (appContainer) => {
  // add interceptors
  appContainer.interceptorManager.addInterceptors([
    new PreRenderInterceptor(),
    new PostRenderInterceptor(appContainer),
  ]);
};
