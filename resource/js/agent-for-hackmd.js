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

const JSON = window.JSON;

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

function postMessageOnChange(body) {
  const data = {
    operation: 'notifyBodyChanges',
    body
  };
  window.parent.postMessage(JSON.stringify(data), allowedOrigin);
}

function postMessageOnSave(body) {
  const data = {
    operation: 'save',
    body
  };
  window.parent.postMessage(JSON.stringify(data), allowedOrigin);
}

function addEventListenersToCodemirror() {
  // get CodeMirror instance
  const codemirror = window.CodeMirror;
  // get CodeMirror editor instance
  const editor = window.editor;

  //// change event
  // generate debounced function
  const debouncedPostMessageOnChange = debounce(1500, postMessageOnChange);
  editor.on('change', (cm, change) => {
    debouncedPostMessageOnChange(cm.doc.getValue());
  });

  //// save event
  // Reset save commands and Cmd-S/Ctrl-S shortcuts that initialized by HackMD
  codemirror.commands.save = function(cm) {
    postMessageOnSave(cm.doc.getValue());
  };
  delete editor.options.extraKeys['Cmd-S'];
  delete editor.options.extraKeys['Ctrl-S'];
}

function setValue(document) {
  // get CodeMirror instance
  const editor = window.editor;
  editor.doc.setValue(document);
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
        setValue(data.document);
        break;
    }
  });

  window.addEventListener('load', (event) => {
    console.log('loaded');
    addEventListenersToCodemirror();
  });

  console.log('[HackMD] GROWI agent for HackMD has successfully loaded.');
}());

