/**
 * Growi::app.js
 *
 * @package growi
 * @author  Yuki Takei <yuki@weseek.co.jp>
 */

var growi = new (require('./lib/crowi'))(__dirname, process.env);

growi.start()
  .catch(growi.exitOnerror);
