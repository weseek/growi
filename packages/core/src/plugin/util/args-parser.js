/**
 * Arguments parser for custom tag
 */
export class ArgsParser {

  /**
   * @typedef ParseArgsResult
   * @property {string} firstArgsKey - key of the first argument
   * @property {string} firstArgsValue - value of the first argument
   * @property {object} options - key of the first argument
   */

  /**
   * parse plugin argument strings
   *
   * @static
   * @param {string} str
   * @returns {ParseArgsResult}
   */
  static parse(str) {
    let firstArgsKey = null;
    let firstArgsValue = null;
    const options = {};

    if (str != null && str.length > 0) {
      const splittedArgs = str.split(',');

      splittedArgs.forEach((rawArg, index) => {
        const arg = rawArg.trim();

        // parse string like 'key1=value1, key2=value2, ...'
        // see https://regex101.com/r/pYHcOM/1
        const match = arg.match(/([^=]+)=?(.+)?/);

        if (match == null) {
          return;
        }

        const key = match[1];
        const value = match[2] || true;
        options[key] = value;

        if (index === 0) {
          firstArgsKey = key;
          firstArgsValue = value;
        }
      });
    }

    return {
      firstArgsKey,
      firstArgsValue,
      options,
    };
  }

}
