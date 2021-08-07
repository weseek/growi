import RefsContext from './RefsContext';

/**
 * Context Object class for $gallery()
 */
export default class GalleryContext extends RefsContext {

  /**
   * @param {object|TagContext|RefsContext} initArgs
   */
  constructor(initArgs, fromPagePath) {
    super(initArgs);

    this.options = {
      grid: 'col-4',
      'grid-gap': '1px',
    };
  }

  get isExtractImg() {
    return true;
  }

}
