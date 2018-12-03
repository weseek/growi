import { LsxPreRenderInterceptor } from './resource/js/util/Interceptor/LsxPreRenderInterceptor';
import { LsxPostRenderInterceptor } from './resource/js/util/Interceptor/LsxPostRenderInterceptor';

module.exports = (crowi, crowiRenderer) => {
  // add interceptors
  crowi.interceptorManager.addInterceptors([
    new LsxPreRenderInterceptor(crowi),
    new LsxPostRenderInterceptor(crowi),
  ]);
};
