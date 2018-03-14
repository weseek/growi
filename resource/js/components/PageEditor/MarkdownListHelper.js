import { BasicInterceptor } from 'crowi-pluginkit';
import * as codemirror from 'codemirror';

import mlu from '../../util/interceptor/MarkdownListUtil';

export default class MarkdownListHelper extends BasicInterceptor {

  constructor() {
    super();

    // https://github.com/codemirror/CodeMirror/blob/c7853a989c77bb9f520c9c530cbe1497856e96fc/addon/edit/continuelist.js#L14
    // https://regex101.com/r/7BN2fR/5
    this.indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;
    this.indentAndMarkOnlyRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;

    this.pasteText = this.pasteText.bind(this);
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'preHandleEnter'
    );
  }

  /**
   * return boolean value whether processable parallel
   */
  isProcessableParallel() {
    return false;
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    console.log(performance.now() + ': AbortContinueMarkdownListInterceptor.process is started');
    const orgContext = args[0];
    const editor = orgContext.editor;

    console.log('AbortContinueMarkdownListInterceptor.process');

    // get strings from current position to EOL(end of line) before break the line
    const strToEol = mlu.getStrToEol(editor);
    if (this.indentAndMarkRE.test(strToEol)) {
      const context = Object.assign(args[0]);   // clone

      console.log('AbortContinueMarkdownListInterceptor.newlineAndIndentContinueMarkdownList: abort auto indent');
      codemirror.commands.newlineAndIndent(editor);
      // replace the line with strToEol (abort auto indent)
      editor.getDoc().replaceRange(strToEol, mlu.getBol(editor), mlu.getEol(editor));

      // report to manager that handling was done
      context.handlers.push(this.className);
    }

    console.log(performance.now() + ': AbortContinueMarkdownListInterceptor.process is finished');

    // resolve
    return Promise.resolve(orgContext);
  }

  /**
   * paste text
   * @param {any} editor An editor instance of CodeMirror
   * @param {any} event
   * @param {string} text
   */
  pasteText(editor, event, text) {
    // get strings from BOL(beginning of line) to current position
    const strFromBol = mlu.getStrFromBol(editor);

    const matched = strFromBol.match(this.indentAndMarkRE);
    // when match indentAndMarkOnlyRE
    // (this means the current position is the beginning of the list item)
    if (this.indentAndMarkOnlyRE.test(strFromBol)) {
      const adjusted = this.adjustPastedData(strFromBol, text);

      // replace
      if (adjusted != null) {
        event.preventDefault();
        editor.getDoc().replaceRange(adjusted, mlu.getBol(editor), editor.getCursor());
      }
    }
  }

  /**
   * return adjusted pasted data by indentAndMark
   *
   * @param {string} indentAndMark
   * @param {string} text
   * @returns adjusted pasted data
   *      returns null when adjustment is not necessary
   */
  adjustPastedData(indentAndMark, text) {
    let adjusted = null;

    // list data (starts with indent and mark)
    if (text.match(this.indentAndMarkRE)) {
      const indent = indentAndMark.match(this.indentAndMarkRE)[1];

      // splice to an array of line
      const lines = text.match(/[^\r\n]+/g);
      // indent
      const replacedLines = lines.map((line) => {
        return indent + line;
      })

      adjusted = replacedLines.join('\n');
    }
    // listful data
    else if (this.isListfulData(text)) {
      // do nothing (return null)
    }
    // not listful data
    else {
      // append `indentAndMark` at the beginning of all lines (except the first line)
      const replacedText = text.replace(/(\r\n|\r|\n)/g, "$1" + indentAndMark);
      // append `indentAndMark` to the first line
      adjusted = indentAndMark + replacedText;
    }

    return adjusted;
  }

  /**
   * evaluate whether `text` is list like data or not
   * @param {string} text
   */
  isListfulData(text) {
    // return false if includes at least one blank line
    // see https://stackoverflow.com/a/16369725
    if (text.match(/^\s*[\r\n]/m) != null) {
      return false;
    }

    const lines = text.match(/[^\r\n]+/g);
    // count lines that starts with indent and mark
    let isListful = false;
    let count = 0;
    lines.forEach((line) => {
      if (line.match(this.indentAndMarkRE)) {
        count++;
      }
      // ensure to be true if it is 50% or more
      if (count >= lines.length / 2) {
        isListful = true;
        return;
      }
    });

    return isListful;
  }
}
