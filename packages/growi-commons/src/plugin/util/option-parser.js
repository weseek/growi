class OptionParser {

  /**
   * parse range expression
   *
   * ex:
   *  1:2 -> { start: 1, end: 2 }
   *  1:  -> { start: 1, end: -1 }
   *  2+3 -> { start: 1, end: 5 }
   *
   * @static
   * @param {any} str
   * @returns
   *
   * @memberOf OptionParser
   */
  static parseRange(str) {
    if (str == null) {
      return null;
    }

    // see: https://regex101.com/r/w4KCwC/4
    const match = str.match(/^(-?[0-9]+)(([:+]{1})(-?[0-9]+)?)?$/);
    if (!match) {
      return null;
    }

    // determine start
    let start;
    let end;

    // has operator
    if (match[3] != null) {
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

module.exports = OptionParser;
