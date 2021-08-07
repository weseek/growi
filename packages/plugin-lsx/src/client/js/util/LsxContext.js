import * as url from 'url';

import { pathUtils } from 'growi-commons';

export class LsxContext {

  constructor() {
    this.currentPagePath = null;
    this.tagExpression = null;
    this.fromPagePath = null;
    this.lsxArgs = null;

    // initialized after parse()
    this.isParsed = null;
    this.pagePath = null;
    this.options = null;
  }

  parse() {
    if (this.isParsed) {
      return;
    }

    // initialize
    let specifiedPath;
    this.options = {};

    if (this.lsxArgs.length > 0) {
      const splittedArgs = this.lsxArgs.split(',');
      let firstArgsKey; let
        firstArgsValue;

      splittedArgs.forEach((arg, index) => {
        const trimedArg = arg.trim();

        // parse string like 'key1=value1, key2=value2, ...'
        // see https://regex101.com/r/pYHcOM/1
        const match = trimedArg.match(/([^=]+)=?(.+)?/);
        const key = match[1];
        const value = match[2] || true;
        this.options[key] = value;

        if (index === 0) {
          firstArgsKey = key;
          firstArgsValue = value;
        }
      });

      // determine specifiedPath
      // order:
      //   1: lsx(prefix=..., ...)
      //   2: lsx(firstArgs, ...)
      //   3: fromPagePath
      specifiedPath = this.options.prefix
          || ((firstArgsValue === true) ? firstArgsKey : undefined)
          || this.fromPagePath;
    }

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
    // eslint-disable-next-line eqeqeq
    if (this.options.depth == undefined) {
      return undefined;
    }
    return this.parseNum(this.options.depth);
  }

  parseNum(str) {
    // eslint-disable-next-line eqeqeq
    if (str == undefined) {
      return undefined;
    }

    // see: https://regex101.com/r/w4KCwC/3
    const match = str.match(/^(-?[0-9]+)(([:+]{1})(-?[0-9]+)?)?$/);
    if (!match) {
      return undefined;
    }

    // determine start
    let start;
    let end;

    // has operator
    // eslint-disable-next-line eqeqeq
    if (match[3] != undefined) {
      start = +match[1];
      const operator = match[3];

      // determine end
      if (operator === ':') {
        end = +match[4] || -1; // set last(-1) if undefined
      }
      else if (operator === '+') {
        end = +match[4] || 0; // plus zero if undefined
        end += start;
      }
    }
    // don't have operator
    else {
      start = 1;
      end = +match[1];
    }

    return { start, end };
  }

}
