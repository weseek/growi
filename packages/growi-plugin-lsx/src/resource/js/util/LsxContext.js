import * as url from 'url';

export class LsxContext {

  currentPagePath;
  tagExpression;
  fromPagePath;
  lsxArgs;

  // initialized after parse()
  isParsed;
  pagePath;
  options;

  parse() {
    if (this.isParsed) {
      return;
    }

    // initialize
    let specifiedPath;
    this.options = {};

    if (this.lsxArgs.length > 0) {
      const splittedArgs = this.lsxArgs.split(',');
      let firstArgsKey, firstArgsValue;

      splittedArgs.forEach((arg, index) => {
        arg = arg.trim();

        // parse string like 'key1=value1, key2=value2, ...'
        // see https://regex101.com/r/pYHcOM/1
        const match = arg.match(/([^=]+)=?(.+)?/);
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
      specifiedPath =
          this.options.prefix ||
          ((firstArgsValue === true) ? firstArgsKey : undefined) ||
          this.fromPagePath;
    }

    // resolve pagePath
    //   when `fromPagePath`=/hoge and `specifiedPath`=./fuga,
    //        `pagePath` to be /hoge/fuga
    //   when `fromPagePath`=/hoge and `specifiedPath`=/fuga,
    //        `pagePath` to be /fuga
    //   when `fromPagePath`=/hoge and `specifiedPath`=undefined,
    //        `pagePath` to be /hoge
    this.pagePath = (specifiedPath !== undefined) ?
        url.resolve(this.addSlashOfEnd(this.fromPagePath), specifiedPath):
        this.fromPagePath;

    this.isParsed = true;
  }

  /**
   * return path that added slash to the end for specified path
   *
   * @param {string} path
   * @returns
   *
   * @memberOf LsxContext
   */
  addSlashOfEnd(path) {
    let returnPath = path;
    if (!path.match(/\/$/)) {
      returnPath += '/';
    }
    return returnPath;
  }

}
