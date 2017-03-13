import { LsxPreRenderInterceptor } from './resource/js/util/Interceptor/LsxPreRenderInterceptor';
import { LsxPostRenderInterceptor } from './resource/js/util/Interceptor/LsxPostRenderInterceptor';

export default (crowi, crowiRenderer) => {
  // import css
  require('./resource/css/index.css');

  // add interceptors
  crowi.interceptorManager.addInterceptors([
    new LsxPreRenderInterceptor(crowi),
    new LsxPostRenderInterceptor(crowi),
  ]);
}
