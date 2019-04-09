import { LsxPreRenderInterceptor } from './client/js/util/Interceptor/LsxPreRenderInterceptor';
import { LsxPostRenderInterceptor } from './client/js/util/Interceptor/LsxPostRenderInterceptor';

module.exports = (crowi, crowiRenderer) => {
  // add interceptors
  crowi.interceptorManager.addInterceptors([
    new LsxPreRenderInterceptor(crowi),
    new LsxPostRenderInterceptor(crowi),
  ]);
};
