import { LsxLogoutInterceptor } from './client/js/util/Interceptor/LsxLogoutInterceptor';
import { LsxPostRenderInterceptor } from './client/js/util/Interceptor/LsxPostRenderInterceptor';
import { LsxPreRenderInterceptor } from './client/js/util/Interceptor/LsxPreRenderInterceptor';

export default () => {
  // add interceptors
  global.interceptorManager.addInterceptors([
    new LsxLogoutInterceptor(),
    new LsxPreRenderInterceptor(),
    new LsxPostRenderInterceptor(),
  ]);
};
