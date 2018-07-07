/**
 * GROWI agent for HackMD
 *
 * This file will be transpiled as a single JS
 *  and should be load from HackMD head via 'lib/routes/hackmd.js' route
 *
 * USAGE:
 *  <script src="${hostname of GROWI}/_hackmd/load-agent"></script>
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 */
import { debounce } from 'throttle-debounce';

/* eslint-disable no-console  */

const allowedOrigin = '{{origin}}';         // will be replaced by swig
const styleFilePath = '{{styleFilePath}}';  // will be replaced by swig

/**
 * Validate origin
 * @param {object} event
 */
function validateOrigin(event) {
  if (event.origin !== allowedOrigin) {
    console.error('[HackMD] Message is rejected.', 'Cause: "event.origin" and "allowedOrigin" does not match');
    return;
  }
}

/**
 * Insert link tag to load style file
 */
function insertStyle() {
  const element = document.createElement('link');
  element.href = styleFilePath;
  element.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(element);
}

function postMessageOnSave() {
  const data = '{ "operation": "notifyBodyChanges" }';
  window.parent.postMessage(data, allowedOrigin);
}

function addEventListenersToCodemirror() {
  // get CodeMirror instance
  const editor = window.editor;

  // generate debounced function
  const debouncedFunc = debounce(1500, postMessageOnSave);

  editor.on('change', (cm, change) => {
    debouncedFunc();
  });
}

/**
 * main
 */
(function() {
  // check HackMD is in iframe
  if (window === window.parent) {
    console.log('[GROWI] Loading agent for HackMD is not processed because currently not in iframe');
    return;
  }

  console.log('[HackMD] Loading GROWI agent for HackMD...');

  insertStyle();

  // Add event listeners
  window.addEventListener('message', (event) => {
    validateOrigin(event);

    const data = JSON.parse(event.data);
    switch (data.operation) {
      case 'getValue':
        console.log('getValue called');
        break;
      case 'setValue':
        console.log('setValue called');
        break;
    }
  });

  window.addEventListener('load', (event) => {
    console.log('loaded');
    addEventListenersToCodemirror();
  });

  console.log('[HackMD] GROWI agent for HackMD has successfully loaded.');
}());

