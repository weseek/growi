/**
 * GROWI styles loader for HackMD
 *
 * This file will be transpiled as a single JS
 *  and should be load from HackMD head via 'routes/hackmd.js' route
 *
 * USAGE:
 *  <script src="${hostname of GROWI}/_hackmd/load-styles"></script>
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */

/* eslint-disable no-console  */

const styles = '{{styles}}';         // will be replaced by swig

/**
 * Insert link tag to load style file
 */
function insertStyle() {
  const element = document.createElement('style');
  element.type = 'text/css';
  element.appendChild(document.createTextNode(styles));
  document.getElementsByTagName('head')[0].appendChild(element);
}

/**
 * main
 */
(function() {
  // check HackMD is in iframe
  if (window === window.parent) {
    console.log('[GROWI] Loading styles for HackMD is not processed because currently not in iframe');
    return;
  }

  console.log('[HackMD] Loading GROWI styles for HackMD...');

  insertStyle();

  console.log('[HackMD] GROWI styles for HackMD has successfully loaded.');
}());
