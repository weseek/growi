import { LsxLogoutInterceptor } from './client/js/util/Interceptor/LsxLogoutInterceptor';
import { LsxPreRenderInterceptor } from './client/js/util/Interceptor/LsxPreRenderInterceptor';
import { LsxPostRenderInterceptor } from './client/js/util/Interceptor/LsxPostRenderInterceptor';

export default (appContainer) => {
  // add interceptors
  appContainer.interceptorManager.addInterceptors([
    new LsxLogoutInterceptor(),
    new LsxPreRenderInterceptor(),
    new LsxPostRenderInterceptor(appContainer),
  ]);
};
