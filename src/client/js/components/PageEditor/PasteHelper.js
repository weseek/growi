import accepts from 'attr-accept';

import markdownListUtil from './MarkdownListUtil';

class PasteHelper {
  constructor() {
    this.pasteText = this.pasteText.bind(this);
  }

  /**
   * paste text
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   */
  pasteText(editor, event) {
    // get data in clipboard
    const text = event.clipboardData.getData('text/plain');

    if (text.length == 0) {
      return;
    }

    markdownListUtil.pasteText(editor, event, text);
  }

  // Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
  /**
   * transplanted from react-dropzone
   * @see https://github.com/react-dropzone/react-dropzone/blob/master/src/utils/index.js
   *
   * @param {*} file
   * @param {*} accept
   */
  fileAccepted(file, accept) {
    return file.type === 'application/x-moz-file' || accepts(file, accept);
  }

  /**
   * transplanted from react-dropzone
   * @see https://github.com/react-dropzone/react-dropzone/blob/master/src/utils/index.js
   *
   * @param {*} file
   * @param {number} maxSize
   * @param {number} minSize
   */
  fileMatchSize(file, maxSize, minSize) {
    return file.size <= maxSize && file.size >= minSize;
  }
}

// singleton pattern
const instance = new PasteHelper();
Object.freeze(instance);
export default instance;
