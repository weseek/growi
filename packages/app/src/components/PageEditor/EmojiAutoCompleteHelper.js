
import emojiData from 'emoji-mart/data/all.json';
import { NimbleEmojiIndex } from 'emoji-mart';
import UpdateDisplayUtil from '~/client/util/codemirror/update-display-util.ext';
// This class will be deleted by GW-7652
class EmojiAutoCompleteHelper {

  constructor() {
    this.showHint = this.showHint.bind(this);
  }


  /**
   * try to find emoji terms and show hint
   * @param {any} editor An editor instance of CodeMirror
   */
  showHint(editor) {
    // see https://regex101.com/r/gy3i03/1
    const pattern = /:[^:\s]+/;

    const currentPos = editor.getCursor();
    // find previous ':shortname'
    const sc = editor.getSearchCursor(pattern, currentPos, { multiline: false });
    if (sc.findPrevious()) {
      const isInputtingEmoji = (currentPos.line === sc.to().line && currentPos.ch === sc.to().ch);
      // return if it isn't inputting emoji
      if (!isInputtingEmoji) {
        return;
      }
    }
    else {
      return;
    }

    /*
     * https://github.com/weseek/growi/issues/703 is caused
     * because 'editor.display.viewOffset' is zero
     *
     * call stack:
     *   1. https://github.com/codemirror/CodeMirror/blob/5.42.0/addon/hint/show-hint.js#L220
     *   2. https://github.com/codemirror/CodeMirror/blob/5.42.0/src/edit/methods.js#L189
     *   3. https://github.com/codemirror/CodeMirror/blob/5.42.0/src/measurement/position_measurement.js#L372
     *   4. https://github.com/codemirror/CodeMirror/blob/5.42.0/src/measurement/position_measurement.js#L315
     */
    UpdateDisplayUtil.forceUpdateViewOffset(editor);

    // see https://codemirror.net/doc/manual.html#addon_show-hint
    editor.showHint({
      completeSingle: false,
      // closeOnUnfocus: false,  // for debug
      hint: () => {
        const matched = editor.getDoc().getRange(sc.from(), sc.to());
        const term = matched.replace(':', ''); // remove ':' in the head

        // get a list of shortnames
        const emojiIndex = new NimbleEmojiIndex(emojiData);
        const shortnames = emojiIndex.search(term);
        if (shortnames.length >= 1) {
          return {
            list: this.generateEmojiRenderer(shortnames),
            from: sc.from(),
            to: sc.to(),
          };
        }
      },
    });
  }

  /**
   * see https://codemirror.net/doc/manual.html#addon_show-hint
   * @param {string[]} emojiShortnames a list of shortname
   */
  // TODO 13 Jan 2022
  generateEmojiRenderer(emojiShortnames) {
    return emojiShortnames.map((emoji) => {
      return {
        text: emoji.colons,
        className: 'crowi-emoji-autocomplete',
        render: (element) => {
          element.innerHTML = `<div class="img-container">${emoji.native}</div>`
            + `<span class="shortname-container">${emoji.colons}</span>`;
        },
      };
    });
  }

}

export default EmojiAutoCompleteHelper;
