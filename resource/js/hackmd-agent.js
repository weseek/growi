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
import Penpal from 'penpal';
// Penpal.debug = true;

import { debounce } from 'throttle-debounce';

/* eslint-disable no-console  */

const allowedOrigin = '{{origin}}';         // will be replaced by swig


/**
 * return the value of CodeMirror
 */
function getValueOfCodemirror() {
  // get CodeMirror instance
  const editor = window.editor;
  return editor.doc.getValue();
}

/**
 * set the specified document to CodeMirror
 * @param {string} value
 */
function setValueToCodemirror(value) {
  // get CodeMirror instance
  const editor = window.editor;
  editor.doc.setValue(value);
}

/**
 * set the specified document to CodeMirror on window loaded
 * @param {string} value
 */
function setValueToCodemirrorOnInit(newValue) {
  if (window.cmClient != null) {
    setValueToCodemirror(newValue);
    return;
  }
  else {
    const intervalId = setInterval(() => {
      if (window.cmClient != null) {
        clearInterval(intervalId);
        setValueToCodemirror(newValue);
      }
    }, 250);
  }
}

/**
 * postMessage to GROWI to notify body changes
 * @param {string} body
 */
function postParentToNotifyBodyChanges(body) {
  window.growi.notifyBodyChanges(body);
}
// generate debounced function
const debouncedPostParentToNotifyBodyChanges = debounce(800, postParentToNotifyBodyChanges);

/**
 * postMessage to GROWI to save with shortcut
 * @param {string} document
 */
function postParentToSaveWithShortcut(document) {
  window.growi.saveWithShortcut(document);
}

function addEventListenersToCodemirror() {
  // get CodeMirror instance
  const codemirror = window.CodeMirror;
  // get CodeMirror editor instance
  const editor = window.editor;

  // e.g. 404 not found
  if (codemirror == null || editor == null) {
    return;
  }

  //// change event
  editor.on('change', (cm, change) => {
    if (change.origin === 'ignoreHistory') {
      // do nothing because this operation triggered by other user
      return;
    }
    debouncedPostParentToNotifyBodyChanges(cm.doc.getValue());
  });

  //// save event
  // Reset save commands and Cmd-S/Ctrl-S shortcuts that initialized by HackMD
  codemirror.commands.save = function(cm) {
    postParentToSaveWithShortcut(cm.doc.getValue());
  };
  delete editor.options.extraKeys['Cmd-S'];
  delete editor.options.extraKeys['Ctrl-S'];
}

function connectToParentWithPenpal() {
  const connection = Penpal.connectToParent({
    parentOrigin: allowedOrigin,
    // Methods child is exposing to parent
    methods: {
      getValue() {
        return getValueOfCodemirror();
      },
      setValue(newValue) {
        setValueToCodemirror(newValue);
      },
      setValueOnInit(newValue) {
        setValueToCodemirrorOnInit(newValue);
      }
    }
  });
  connection.promise.then(parent => {
    window.growi = parent;
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

  window.addEventListener('load', (event) => {
    console.log('loaded');
    addEventListenersToCodemirror();
  });

  connectToParentWithPenpal();

  console.log('[HackMD] GROWI agent for HackMD has successfully loaded.');
}());

