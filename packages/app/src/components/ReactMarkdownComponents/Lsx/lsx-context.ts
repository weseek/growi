import * as url from 'url';

import { customTagUtils, pathUtils } from '@growi/core';

const { TagContext, ArgsParser, OptionParser } = customTagUtils;

export class LsxContext extends TagContext {

  fromPagePath: string;

  isParsed?: boolean;

  pagePath?: string;

  options?: any;


  parse() {
    if (this.isParsed) {
      return;
    }

    const parsedResult = ArgsParser.parse(this.args);
    this.options = parsedResult.options;

    // determine specifiedPath
    // order:
    //   1: lsx(prefix=..., ...)
    //   2: lsx(firstArgs, ...)
    //   3: fromPagePath
    const specifiedPath = this.options.prefix
        ?? ((parsedResult.firstArgsValue === true) ? parsedResult.firstArgsKey : undefined)
        ?? this.fromPagePath;

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
