import PukiwikiLikeLinker from './resource/js/util/PreProcessor/PukiwikiLikeLinker';

export default (appContainer) => {
  // add preprocessor to head of array
  window.growiRenderer.preProcessors.unshift(new PukiwikiLikeLinker());
};
