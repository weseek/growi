import RefsPostRenderInterceptor from './client/js/util/Interceptor/RefsPostRenderInterceptor';
import RefsPreRenderInterceptor from './client/js/util/Interceptor/RefsPreRenderInterceptor';

export default (appContainer) => {
  // add interceptors
  appContainer.interceptorManager.addInterceptors([
    new RefsPreRenderInterceptor(),
    new RefsPostRenderInterceptor(),
  ]);
};
