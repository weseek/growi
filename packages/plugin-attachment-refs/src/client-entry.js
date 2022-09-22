import RefsPostRenderInterceptor from './client/js/util/Interceptor/RefsPostRenderInterceptor';
import RefsPreRenderInterceptor from './client/js/util/Interceptor/RefsPreRenderInterceptor';

export default () => {
  // add interceptors
  global.interceptorManager.addInterceptors([
    new RefsPreRenderInterceptor(),
    new RefsPostRenderInterceptor(),
  ]);
};
