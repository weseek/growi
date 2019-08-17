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
  constructor(initArgs) {
    super(initArgs);

    this.fromPagePath = null;

    // initialized after parse()
    this.isParsed = null;
    this.pagePath = null;
    this.options = {};
  }

  parse() {
    if (this.isParsed) {
      return;
    }

    const parsedResult = ArgsParser.parse(this.args);
    this.options = parsedResult.options;

    // determine specifiedPath
    // order:
    //   1: refs(prefix=..., ...)
    //   2: refs(firstArgs, ...)
    //   3: fromPagePath
    const specifiedPath = this.options.prefix
        || ((parsedResult.firstArgsValue === true) ? parsedResult.firstArgsKey : undefined)
        || this.fromPagePath;

    // resolve pagePath
    //   when `fromPagePath`=/hoge and `specifiedPath`=./fuga,
    //        `pagePath` to be /hoge/fuga
    //   when `fromPagePath`=/hoge and `specifiedPath`=/fuga,
    //        `pagePath` to be /fuga
    //   when `fromPagePath`=/hoge and `specifiedPath`=undefined,
    //        `pagePath` to be /hoge
    this.pagePath = (specifiedPath !== undefined)
      ? decodeURIComponent(url.resolve(pathUtils.addTrailingSlash(this.fromPagePath), specifiedPath))
      : this.fromPagePath;

    this.isParsed = true;
  }

  getOptDepth() {
    if (this.options.depth === undefined) {
      return undefined;
    }
    return OptionParser.parseRange(this.options.depth);
  }

}
