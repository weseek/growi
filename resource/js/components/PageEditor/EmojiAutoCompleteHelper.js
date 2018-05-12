class EmojiAutoCompleteHelper {

  constructor(emojiStrategy) {
    this.emojiStrategy = emojiStrategy;

    this.emojiShortnameImageMap = {};

    this.initEmojiImageMap = this.initEmojiImageMap.bind(this);
    this.showHint = this.showHint.bind(this);

    this.initEmojiImageMap();
  }

  initEmojiImageMap() {
    for (let unicode in this.emojiStrategy) {
      const data = this.emojiStrategy[unicode];
      const shortname = data.shortname;
      // add image tag
      this.emojiShortnameImageMap[shortname] = emojione.shortnameToImage(shortname);
    }
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

    // see https://codemirror.net/doc/manual.html#addon_show-hint
    editor.showHint({
      completeSingle: false,
      // closeOnUnfocus: false,  // for debug
      hint: () => {
        const matched = editor.getDoc().getRange(sc.from(), sc.to());
        const term = matched.replace(':', '');  // remove ':' in the head

        // get a list of shortnames
        const shortnames = this.searchEmojiShortnames(term);
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
  generateEmojiRenderer(emojiShortnames) {
    return emojiShortnames.map((shortname) => {
      return {
        text: shortname,
        className: 'crowi-emoji-autocomplete',
        render: (element) => {
          element.innerHTML =
            `<div class="img-container">${this.emojiShortnameImageMap[shortname]}</div>` +
            `<span class="shortname-container">${shortname}</span>`;
        }
      };
    });
  }

  /**
   * transplanted from https://github.com/emojione/emojione/blob/master/examples/OTHER.md
   * @param {string} term
   * @returns {string[]} a list of shortname
   */
  searchEmojiShortnames(term) {
    const maxLength = 12;

    let results1 = [], results2 = [], results3 = [], results4 = [];
    const countLen1 = () => { results1.length };
    const countLen2 = () => { countLen1() + results2.length };
    const countLen3 = () => { countLen2() + results3.length };
    const countLen4 = () => { countLen3() + results4.length };
    // TODO performance tune
    // when total length of all results is less than `maxLength`
    for (let unicode in this.emojiStrategy) {
      const data = this.emojiStrategy[unicode];

      if (maxLength <= countLen1()) { break }
      // prefix match to shortname
      else if (data.shortname.indexOf(`:${term}`) > -1) {
        results1.push(data.shortname);
        continue;
      }
      else if (maxLength <= countLen2()) { continue }
      // partial match to shortname
      else if (data.shortname.indexOf(term) > -1) {
        results2.push(data.shortname);
        continue;
      }
      else if (maxLength <= countLen3()) { continue }
      // partial match to elements of aliases
      else if ((data.aliases != null) && data.aliases.find(elem => elem.indexOf(term) > -1)) {
        results3.push(data.shortname);
        continue;
      }
      else if (maxLength <= countLen4()) { continue }
      // partial match to elements of keywords
      else if ((data.keywords != null) && data.keywords.find(elem => elem.indexOf(term) > -1)) {
        results4.push(data.shortname);
      }
    }

    let results = results1.concat(results2).concat(results3).concat(results4);
    results = results.slice(0, maxLength);

    return results;
  }

}

export default EmojiAutoCompleteHelper;
