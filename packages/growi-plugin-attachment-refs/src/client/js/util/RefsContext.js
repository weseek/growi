import * as url from 'url';

import { customTagUtils, pathUtils } from 'growi-commons';

const { TagContext, ArgsParser, OptionParser } = customTagUtils;

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
    this.options = parsedArgs.options;

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
    // determine fileName
    // order:
    //   1: ref(file=..., ...)
    //   2: refs(firstArgs, ...)
    this.fileName = this.options.file
      || ((parsedArgs.firstArgsValue === true) ? parsedArgs.firstArgsKey : undefined);

    if (this.fileName == null) {
      throw new Error('fileName is not specified. set first argument or specify \'file\' option');
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

  getOptColumnSize() {
    const { grid } = this.options;

    let columnSize = null;

    if (grid != null) {
      switch (grid) {
        case 'col-6':
          columnSize = 6;
          break;
        case 'col-4':
          columnSize = 4;
          break;
        case 'col-3':
          columnSize = 3;
          break;
        case 'col-2':
          columnSize = 2;
          break;
        case 'col-1':
          columnSize = 1;
          break;
      }
    }

    return columnSize;
  }

  /**
   * return absolute path for the specified path
   *
   * @param {string} relativePath relative path from `this.fromPagePath`
   */
  getAbsolutePathFor(relativePath) {
    return decodeURIComponent(
      pathUtils.normalizePath( // normalize like /foo/bar
        url.resolve(pathUtils.addTrailingSlash(this.fromPagePath), relativePath)
      ),
    );
  }
}
