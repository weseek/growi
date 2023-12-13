import { EditorView } from '@codemirror/view';

const lineBeginPartOfDrawioRE = /^```(\s.*)drawio$/;
const lineEndPartOfDrawioRE = /^```$/;
const firstLineNum = 1;

// get cursor position
const curPos = (editor: EditorView) => {
  return editor.state.selection.main.head;
};

// get doc
const doc = (editor: EditorView) => {
  return editor.state.doc;
};

// get last line number
const lastLineNum = (editor: EditorView) => {
  return doc(editor).lines;
};

// get cursor line
const getCursorLine = (editor: EditorView) => {
  return doc(editor).lineAt(curPos(editor));
};

// get line
const getLine = (editor: EditorView, lineNum: number) => {
  return doc(editor).line(lineNum);
};

/**
   * return the postion of the BOD(beginning of drawio)
   * (If the BOD is not found after the cursor or the EOD is found before the BOD, return null)
   */
const getBod = (editor: EditorView) => {
  const strLine = getCursorLine(editor).text;
  if (lineBeginPartOfDrawioRE.test(strLine)) {
    // get the beginning of the line where the cursor is located
    return getCursorLine(editor).from;
  }

  let line = getCursorLine(editor).number - 1;
  let isFound = false;
  for (; line >= firstLineNum; line--) {
    const strLine = getLine(editor, line).text;
    if (lineBeginPartOfDrawioRE.test(strLine)) {
      isFound = true;
      break;
    }

    if (lineEndPartOfDrawioRE.test(strLine)) {
      isFound = false;
      break;
    }
  }

  if (!isFound) {
    return null;
  }

  const botLine = Math.max(firstLineNum, line);
  return getLine(editor, botLine).from;
};

/**
   * return the postion of the EOD(end of drawio)
   * (If the EOD is not found after the cursor or the BOD is found before the EOD, return null)
   */
const getEod = (editor: EditorView) => {
  const lastLine = lastLineNum(editor);

  const strLine = getCursorLine(editor).text;
  if (lineEndPartOfDrawioRE.test(strLine)) {
    // get the end of the line where the cursor is located
    return getCursorLine(editor).to;
  }

  let line = getCursorLine(editor).number + 1;
  let isFound = false;
  for (; line <= lastLine; line++) {
    const strLine = getLine(editor, line).text;
    if (lineEndPartOfDrawioRE.test(strLine)) {
      isFound = true;
      break;
    }

    if (lineBeginPartOfDrawioRE.test(strLine)) {
      isFound = false;
      break;
    }
  }

  if (!isFound) {
    return null;
  }

  const eodLine = Math.min(line, lastLine);
  return getLine(editor, eodLine).to;
};

/**
   * return boolean value whether the cursor position is in a drawio
   */
const isInDrawioBlock = (editor: EditorView) => {
  const bod = getBod(editor);
  const eod = getEod(editor);
  if (bod === null || eod === null) {
    return false;
  }
  return JSON.stringify(bod) !== JSON.stringify(eod);
};

/**
   * return drawioData instance where the cursor is
   * (If the cursor is not in a drawio block, return null)
   */
export const getMarkdownDrawioMxfile = (editor: EditorView): string | null => {
  if (isInDrawioBlock(editor)) {
    const bod = getBod(editor);
    const eod = getEod(editor);
    if (bod == null || eod == null) {
      return null;
    }

    // skip block begin sesion("``` drawio")
    const bodLineNum = doc(editor).lineAt(bod).number + 1;
    const bodLine = getLine(editor, bodLineNum).from;
    // skip block end sesion("```")
    const eodLineNum = doc(editor).lineAt(eod).number - 1;
    const eodLine = getLine(editor, eodLineNum).to;

    return editor.state.sliceDoc(bodLine, eodLine);
  }
  return null;
};

export const replaceFocusedDrawioWithEditor = (editor: EditorView, drawioData: string): void => {
  const drawioBlock = ['``` drawio', drawioData.toString(), '```'].join('\n');
  let beginPos;
  let endPos;

  if (isInDrawioBlock(editor)) {
    beginPos = getBod(editor);
    endPos = getEod(editor);
  }
  else {
    beginPos = curPos(editor);
    endPos = curPos(editor);
  }

  editor.dispatch({
    changes: {
      from: beginPos,
      to: endPos,
      insert: drawioBlock,
    },
  });
};

/**
   * return an array of the starting line numbers of the drawio sections found in markdown
   */
export const findAllDrawioSection = (editor: EditorView): number[] => {
  const lineNumbers: number[] = [];
  // refs: https://github.com/codemirror/CodeMirror/blob/5.64.0/addon/fold/foldcode.js#L106-L111
  for (let i = firstLineNum, e = lastLineNum(editor); i <= e; i++) {
    const lineTxt = getLine(editor, i).text;
    const match = lineBeginPartOfDrawioRE.exec(lineTxt);
    if (match) {
      lineNumbers.push(i);
    }
  }
  return lineNumbers;
};
