import { LsxPreProcessor } from './resource/js/util/PreProcessor/LsxPreProcessor';

export default (crowi, crowiRenderer) => {
  crowiRenderer.preProcessors = crowiRenderer.preProcessors.concat(
        crowiRenderer.preProcessors, [new LsxPreProcessor()]);
}
