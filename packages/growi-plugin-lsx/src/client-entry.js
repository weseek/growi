import { LsxPreProcessor } from './resource/js/util/PreProcessor/LsxPreProcessor';
import { LsxPostRenderInterceptor } from './resource/js/util/Interceptor/LsxPostRenderInterceptor';

export default (crowi, crowiRenderer) => {
  // import css
  require('./resource/css/index.css');

  // add preprocessor
  crowiRenderer.preProcessors = crowiRenderer.preProcessors.concat([
    new LsxPreProcessor(crowi),
  ]);
  // add interceptor
  crowi.interceptorManager.addInterceptors([
    new LsxPostRenderInterceptor(crowi)
  ]);
}
