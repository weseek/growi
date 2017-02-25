import { PukiwikiLikeLinker } from './resource/js/util/PreProcessor/PukiwikiLikeLinker';

export default {
  pluginSchemaVersion: 1,
  preProcessorFactories: [
    (crowi) => {
      return new PukiwikiLikeLinker();
    }
  ]
}