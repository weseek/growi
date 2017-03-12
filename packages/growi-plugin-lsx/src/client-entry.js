import { LsxPreProcessor } from './resource/js/util/PreProcessor/LsxPreProcessor';

export default (crowi, crowiRenderer) => {
  // import css
  require('./resource/css/index.css');

  // add preprocessor
  crowiRenderer.preProcessors = crowiRenderer.preProcessors.concat([
    new LsxPreProcessor(crowi),
  ]);
}
