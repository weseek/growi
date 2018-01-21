import React from 'react';
import PropTypes from 'prop-types';

import emojione from 'emojione';
import emojiStrategy from 'emojione/emoji_strategy.json';
import * as codemirror from 'codemirror';

import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
require('codemirror/lib/codemirror.css');
require('codemirror/addon/display/autorefresh');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/matchtags');
require('codemirror/addon/edit/closetag');
require('codemirror/addon/edit/continuelist');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/search/searchcursor');
require('codemirror/addon/search/match-highlighter');
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/mode/gfm/gfm');
require('codemirror/theme/eclipse.css');

export default class Editor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
    };

    this.initEmojiImageMap = this.initEmojiImageMap.bind(this);
    this.getCodeMirror = this.getCodeMirror.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.forceToFocus = this.forceToFocus.bind(this);
    this.dispatchSave = this.dispatchSave.bind(this);
    this.autoCompleteEmoji = this.autoCompleteEmoji.bind(this);

    this.initEmojiImageMap()
  }

  componentDidMount() {
    // initialize caret line
    this.setCaretLine(0);
    // set save handler
    codemirror.commands.save = this.dispatchSave;
  }

  initEmojiImageMap() {
    this.emojiShortnameImageMap = {};
    for (let unicode in emojiStrategy) {
      const data = emojiStrategy[unicode];
      const shortname = data.shortname;
      // add image tag
      this.emojiShortnameImageMap[shortname] = emojione.shortnameToImage(shortname);
    }
  }

  getCodeMirror() {
    return this.refs.cm.editor;
  }

  forceToFocus() {
    const editor = this.getCodeMirror();
    // use setInterval with reluctance -- 2018.01.11 Yuki Takei
    const intervalId = setInterval(() => {
      this.getCodeMirror().focus();
      if (editor.hasFocus()) {
        clearInterval(intervalId);
      }
    }, 100);
  }

  /**
   * set caret position of codemirror
   * @param {string} number
   */
  setCaretLine(line) {
    const editor = this.getCodeMirror();
    editor.setCursor({line: line-1});   // leave 'ch' field as null/undefined to indicate the end of line
  }

  /**
   * try to find emoji terms and show hint
   */
  autoCompleteEmoji() {
    const cm = this.getCodeMirror();

    // see https://regex101.com/r/gy3i03/1
    const pattern = /:[^:\s]+/

    const currentPos = cm.getCursor();
    // find previous ':shortname'
    const sc = cm.getSearchCursor(pattern, currentPos, { multiline: false });
    if (sc.findPrevious()) {
      const isInputtingEmoji = (currentPos.line === sc.to().line && currentPos.ch === sc.to().ch);
      // return if it isn't inputting emoji
      if (!isInputtingEmoji) {
        return;
      }
    }

    // see https://codemirror.net/doc/manual.html#addon_show-hint
    cm.showHint({
      completeSingle: false,
      hint: () => {
        const matched = cm.getDoc().getRange(sc.from(), sc.to());
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
   * @param {any}
   */
  generateEmojiRenderer(emojiShortnames) {
    return emojiShortnames.map((shortname) => {
      return {
        text: shortname,
        render: (element) => {
          element.innerHTML = `${this.emojiShortnameImageMap[shortname]} ${shortname}`;
        }
      }
    });
  }

  /**
   * transplanted from https://github.com/emojione/emojione/blob/master/examples/OTHER.md
   * @param {string} term
   * @returns {string[]} a list of shortname
   */
  searchEmojiShortnames(term) {
    const maxLength = 12;

    var results = [];
    var results2 = [];
    var results3 = [];
    var results4 = [];
    // TODO performance tune
    // when total length of all results is less than `maxLength`
    for (let unicode in emojiStrategy) {
      const data = emojiStrategy[unicode];

      // prefix match to shortname
      if (maxLength <= results.length) {
        break;
      }
      else if (data.shortname.indexOf(`:${term}`) > -1) {
        results.push(data.shortname);
        continue;
      }
      // partial match to shortname
      if (maxLength <= results.length) {
        continue;
      }
      else if (data.shortname.indexOf(term) > -1) {
        results2.push(data.shortname);
        continue;
      }
      // partial match to aliases
      if (maxLength <= results.length + results2.length) {
        continue;
      }
      else if ((data.aliases != null) && (data.aliases.indexOf(term) > -1)) {
        results3.push(data.shortname);
        continue;
      }
      // partial match to keywords
      if (maxLength <= results.length + results2.length + results3.length) {
        continue;
      }
      else if ((data.keywords != null) && (data.keywords.indexOf(term) > -1)) {
        results4.push(data.shortname);
      }
    };

    if (term.length >= 3) {
        results.sort(function(a,b) { return (a.length > b.length); });
        results2.sort(function(a,b) { return (a.length > b.length); });
        results3.sort(function(a,b) { return (a.length > b.length); });
        results4.sort();
    }
    var newResults = results.concat(results2).concat(results3).concat(results4);
    newResults = newResults.slice(0, maxLength);

    return newResults;
  }

  /**
   * dispatch onSave event
   */
  dispatchSave() {
    if (this.props.onSave != null) {
      this.props.onSave();
    }
  }

  render() {
    return (
      <ReactCodeMirror
        ref="cm"
        value={this.state.value}
        options={{
          mode: 'gfm',
          theme: 'eclipse',
          lineNumbers: true,
          tabSize: 4,
          indentUnit: 4,
          lineWrapping: true,
          autoRefresh: true,
          autoCloseTags: true,
          matchBrackets: true,
          matchTags: {bothTags: true},
          // match-highlighter, matchesonscrollbar, annotatescrollbar options
          highlightSelectionMatches: {annotateScrollbar: true},
          // markdown mode options
          highlightFormatting: true,
          // continuelist, indentlist
          extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList",
            "Tab": "indentMore",
            "Shift-Tab": "indentLess",
          }
        }}
        onScroll={(editor, data) => {
          if (this.props.onScroll != null) {
            this.props.onScroll(data);
          }
        }}
        onChange={(editor, data, value) => {
          if (this.props.onChange != null) {
            this.props.onChange(value);
          }

          // Emoji AutoComplete
          this.autoCompleteEmoji(editor);
        }}
      />
    )
  }

}

Editor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onScroll: PropTypes.func,
  onSave: PropTypes.func,
};
