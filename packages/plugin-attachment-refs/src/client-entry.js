import RefsPreRenderInterceptor from './client/js/util/Interceptor/RefsPreRenderInterceptor';
import RefsPostRenderInterceptor from './client/js/util/Interceptor/RefsPostRenderInterceptor';

export default (appContainer) => {
  // add interceptors
  appContainer.interceptorManager.addInterceptors([
    new RefsPreRenderInterceptor(),
    new RefsPostRenderInterceptor(),
  ]);
};
