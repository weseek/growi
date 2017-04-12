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
    let lsxPrefix = this.lsxArgs || this.fromPagePath;
    this.options = {};

    // if args is a String like 'key1=value1, key2=value2, ...'
    const splittedArgs = this.lsxArgs.split(',');
    if (splittedArgs.length > 1) {
      splittedArgs.forEach((arg) => {
        arg = arg.trim();

        // see https://regex101.com/r/pYHcOM/1
        const match = arg.match(/([^=]+)=?(.+)?/);
        const value = match[2] || true;
        this.options[match[1]] = value;
      });

      // determine prefix
      // 'prefix=foo' pattern or the first argument
      lsxPrefix = this.options.prefix || splittedArgs[0];
    }

    // resolve url
    this.pagePath = url.resolve(this.fromPagePath, lsxPrefix);

    this.isParsed = true;
  }
}
