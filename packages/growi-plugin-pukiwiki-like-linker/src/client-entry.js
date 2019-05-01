import PukiwikiLikeLinker from './resource/js/util/PreProcessor/PukiwikiLikeLinker';

module.exports = (crowi, crowiRenderer) => {
  // add preprocessor to head of array
  crowiRenderer.preProcessors.unshift(new PukiwikiLikeLinker());
};
