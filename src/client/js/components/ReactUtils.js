import React from 'react';

export default class ReactUtils {

  /**
   * show '\n' as '<br>'
   *
   * @see http://qiita.com/kouheiszk/items/e7c74ab5eab901f89a7f
   *
   * @static
   * @param {any} text
   * @returns
   *
   * @memberOf ReactUtils
   */
  static nl2br(text) {
    var regex = /(\n)/g;
    return text.split(regex).map(function(line) {
      if (line.match(regex)) {
        return React.createElement('br', {key: Math.random().toString(10).substr(2, 10)});
      }
      else {
        return line;
      }
    });
  }

}
