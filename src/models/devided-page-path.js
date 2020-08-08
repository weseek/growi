const { pathUtils } = require('growi-commons');

// https://regex101.com/r/BahpKX/2
const PATTERN_INCLUDE_DATE = /^(.+\/[^/]+)\/(\d{4}|\d{4}\/\d{2}|\d{4}\/\d{2}\/\d{2})$/;
// https://regex101.com/r/WVpPpY/1
const PATTERN_DEFAULT = /^((.*)\/)?([^/]+)$/;

class DevidedPagePath {

  constructor(path, skipNormalize = false, evalDatePath = false) {

    this.isRoot = false;
    this.isFormerRoot = false;
    this.former = null;
    this.latter = null;

    // root
    if (path == null || path === '' || path === '/') {
      this.isRoot = true;
      this.latter = '/';
      return;
    }

    const pagePath = skipNormalize ? path : pathUtils.normalizePath(path);
    this.latter = pagePath;

    // evaluate date path
    if (evalDatePath) {
      const matchDate = pagePath.match(PATTERN_INCLUDE_DATE);
      if (matchDate != null) {
        this.former = matchDate[1];
        this.latter = matchDate[2];
        return;
      }
    }

    const matchDefault = pagePath.match(PATTERN_DEFAULT);
    if (matchDefault != null) {
      this.isFormerRoot = matchDefault[1] === '/';
      this.former = matchDefault[2];
      this.latter = matchDefault[3];
    }
  }

}

module.exports = DevidedPagePath;
