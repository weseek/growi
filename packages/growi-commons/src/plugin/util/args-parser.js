class ArgsParser {

  /**
   * parse plugin argument strings
   *
   * @static
   * @param {string} str
   * @returns {object} { fistArgsKey: 'key', firstArgsValue: 'val', options: {..} }
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

module.exports = ArgsParser;
