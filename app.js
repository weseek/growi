/**
 * Crowi::app.js
 *
 * @package crowi-plus
 * @author  Yuki Takei <yuki@weseek.co.jp>
 */

var crowi = new (require('./lib/crowi'))(__dirname, process.env);

crowi.start()
  .catch(crowi.exitOnerror);
