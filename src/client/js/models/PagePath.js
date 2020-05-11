import { pathUtils } from 'growi-commons';

// https://regex101.com/r/BahpKX/2
const PATTERN_INCLUDE_DATE = /^(.+\/[^/]+)\/(\d{4}|\d{4}\/\d{2}|\d{4}\/\d{2}\/\d{2})$/;
// https://regex101.com/r/WVpPpY/1
const PATTERN_DEFAULT = /^((.*)\/)?([^/]+)$/;

export default class PagePath {

  constructor(path, evalDatePath = false, skipNormalize = false) {

    const pagePath = skipNormalize ? path : pathUtils.normalizePath(path);

    this.former = null;
    this.latter = pagePath;

    // root
    if (pagePath === '/') {
      return;
    }

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
      this.former = matchDefault[2];
      this.latter = matchDefault[3];
    }
  }

}
