/* eslint-disable */

import mdu from '../../../components/PageEditor/MarkdownDrawioUtil.js';

(function(mod) {
  mod(require("codemirror"));
})(function(CodeMirror) {
  "use strict"

  CodeMirror.registerGlobalHelper('fold', 'drawio', function (mode, cm) {
    return true;
  }, function(cm, start) {
    function isBeginningOfDrawio(lineNo) {
      let line = cm.getLine(lineNo);
      let match = mdu.lineBeginPartOfDrawioRE.exec(line);
      if (match) {
        return true;
      }
      return false;
    }
    function isEndOfDrawio(lineNo) {
      let line = cm.getLine(lineNo);
      let match = mdu.lineEndPartOfDrawioRE.exec(line);
      if (match) {
        return true;
      }
      return false;
    }

    let drawio = isBeginningOfDrawio(start.line);
    if (drawio === false) { return; }

    let lastLine = cm.lastLine();
    let end = start.line;
    while(end < lastLine) {
      end += 1;
      if (isEndOfDrawio(end)) {
        break;
      }
    }

    return {
      from: CodeMirror.Pos(start.line, cm.getLine(start.line).length),
      to: CodeMirror.Pos(end, cm.getLine(end).length)
    };
  });
});
