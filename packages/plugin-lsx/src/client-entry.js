import { LsxPreRenderInterceptor } from './client/js/util/Interceptor/LsxPreRenderInterceptor';
import { LsxPostRenderInterceptor } from './client/js/util/Interceptor/LsxPostRenderInterceptor';

export default (appContainer) => {
  // add interceptors
  appContainer.interceptorManager.addInterceptors([
    new LsxPreRenderInterceptor(),
    new LsxPostRenderInterceptor(appContainer),
  ]);
};
