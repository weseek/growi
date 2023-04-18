import * as url from 'url';

import {
  TagContext, ArgsParser, OptionParser, pathUtils,
} from '@growi/core';

const GRID_DEFAULT_TRACK_WIDTH = 64;
const GRID_AVAILABLE_OPTIONS_LIST = [
  'autofill',
  'autofill-xs',
  'autofill-sm',
  'autofill-md',
  'autofill-lg',
  'autofill-xl',
  'col-2',
  'col-3',
  'col-4',
  'col-5',
  'col-6',
];

/**
 * Context Object class for $refs() and $refsimg()
 */
export default class RefsContext extends TagContext {

  /**
   * @param {object|TagContext|RefsContext} initArgs
   */
  constructor(initArgs, fromPagePath) {
    super(initArgs);

    this.fromPagePath = fromPagePath;

    // initialized after parse()
    this.pagePath = null;
    this.isParsed = null;
    this.options = {};
  }

  get isSingle() {
    return this.method.match(/^(ref|refimg)$/);
  }

  get isExtractImg() {
    return this.method.match(/^(refimg|refsimg)$/);
  }

  parse() {
    if (this.isParsed) {
      return;
    }

    const parsedArgs = ArgsParser.parse(this.args);
    this.options = Object.assign(this.options, parsedArgs.options);

    if (this.isSingle) {
      this.parseForSingle(parsedArgs);
    }
    else {
      this.parseForMulti(parsedArgs);
    }

    this.isParsed = true;
  }

  /**
   * parse method for 'ref' and 'refimg'
   */
  parseForSingle(parsedArgs) {
    // determine fileNameOrId
    // order:
    //   1: ref(file=..., ...)
    //   2: ref(id=..., ...)
    //   2: refs(firstArgs, ...)
    this.fileNameOrId = this.options.file || this.options.id
      || ((parsedArgs.firstArgsValue === true) ? parsedArgs.firstArgsKey : undefined);

    if (this.fileNameOrId == null) {
      throw new Error('\'file\' or \'id\' is not specified. Set first argument or specify \'file\' or \'id\' option');
    }

    // determine pagePath
    // order:
    //   1: ref(page=..., ...)
    //   2: constructor argument
    const specifiedPath = this.options.page || this.fromPagePath;
    this.pagePath = this.getAbsolutePathFor(specifiedPath);
  }

  /**
   * parse method for 'refs' and 'refsimg'
   */
  parseForMulti(parsedArgs) {
    if (this.options.prefix) {
      this.prefix = this.resolvePath(this.options.prefix);
    }
    else {
      // determine pagePath
      // order:
      //   1: ref(page=..., ...)
      //   2: refs(firstArgs, ...)
      //   3: constructor argument
      const specifiedPath = this.options.page
      || ((parsedArgs.firstArgsValue === true) ? parsedArgs.firstArgsKey : undefined)
      || this.fromPagePath;

      this.pagePath = this.getAbsolutePathFor(specifiedPath);
    }

    if (this.options.grid != null && this.getOptGrid() == null) {
      throw new Error('\'grid\' option is invalid. '
        + 'Available value is: \'autofill-( xs | sm | md | lg | xl )\' or \'col-( 2 | 3 | 4 | 5 | 6 )\'');
    }
  }

  // resolve pagePath
  //   when `fromPagePath`=/hoge and `specifiedPath`=./fuga,
  //        `pagePath` to be /hoge/fuga
  //   when `fromPagePath`=/hoge and `specifiedPath`=/fuga,
  //        `pagePath` to be /fuga
  //   when `fromPagePath`=/hoge and `specifiedPath`=undefined,
  //        `pagePath` to be /hoge
  resolvePath(pagePath) {
    return decodeURIComponent(url.resolve(pathUtils.addTrailingSlash(this.fromPagePath), pagePath));
  }

  getOptDepth() {
    if (this.options.depth === undefined) {
      return undefined;
    }
    return OptionParser.parseRange(this.options.depth);
  }

  getOptGrid() {
    const { grid } = this.options;
    return GRID_AVAILABLE_OPTIONS_LIST.find(item => item === grid);
  }

  isOptGridColumnEnabled() {
    const optGrid = this.getOptGrid();
    return (optGrid != null) && optGrid.startsWith('col-');
  }

  getOptGridColumnsNum() {
    const { grid } = this.options;

    let columnsNum = null;

    switch (grid) {
      case 'col-2':
        columnsNum = 2;
        break;
      case 'col-3':
        columnsNum = 3;
        break;
      case 'col-4':
        columnsNum = 4;
        break;
      case 'col-5':
        columnsNum = 5;
        break;
      case 'col-6':
        columnsNum = 6;
        break;
    }

    return columnsNum;
  }

  /**
   * return auto-calculated grid width
   * rules:
   *  1. when column mode (e.g. col-6, col5, ...), the width specification is disabled
   *  2. when width option is set, return it
   *  3. otherwise, the mode should be autofill and the width will be calculated according to the size
   */
  getOptGridWidth() {
    const grid = this.getOptGrid();
    const { width } = this.options;

    // when Grid column mode
    if (this.isOptGridColumnEnabled()) {
      // not specify and ignore width
      return undefined;
    }

    // when width is specified
    if (width != null) {
      return width;
    }

    // when Grid autofill mode
    let autofillMagnification = 1;

    switch (grid) {
      case 'autofill-xl':
        autofillMagnification = 3;
        break;
      case 'autofill-lg':
        autofillMagnification = 2;
        break;
      case 'autofill-sm':
        autofillMagnification = 0.75;
        break;
      case 'autofill-xs':
        autofillMagnification = 0.5;
        break;
      case 'autofill':
      case 'autofill-md':
        break;
    }

    return `${GRID_DEFAULT_TRACK_WIDTH * autofillMagnification}px`;
  }

  /**
   * return auto-calculated grid height
   * rules:
   *  1. when height option is set, return it
   *  2. otherwise, the same value to the width will be returned
   */

  getOptGridHeight() {
    const { height } = this.options;

    // when height is specified
    if (height != null) {
      return height;
    }

    // return the value which is same to width
    return this.getOptGridWidth();
  }

  /**
   * return absolute path for the specified path
   *
   * @param {string} relativePath relative path from `this.fromPagePath`
   */
  getAbsolutePathFor(relativePath) {
    return decodeURIComponent(
      pathUtils.normalizePath( // normalize like /foo/bar
        url.resolve(pathUtils.addTrailingSlash(this.fromPagePath), relativePath),
      ),
    );
  }

}
