import type { EditorView } from '@codemirror/view';

const lineBeginPartOfDrawioRE = /^```(\s.*)drawio$/;
const lineEndPartOfDrawioRE = /^```$/;

// get cursor position from editor
const curPos = (editor: EditorView) => {
  return editor.state.selection.main.head;
};

// get doc from editor
const doc = (editor: EditorView) => {
  return editor.state.doc;
};

/**
   * return the postion of the BOD(beginning of drawio)
   * (If the BOD is not found after the cursor or the EOD is found before the BOD, return null)
   */
const getBod = (editor: EditorView) => {
  const firstLine = 1;

  const strLine = doc(editor).lineAt(curPos(editor)).text;
  if (lineBeginPartOfDrawioRE.test(strLine)) {
    // get the beginning of the line where the cursor is located
    return doc(editor).lineAt(curPos(editor)).from;
  }

  let line = doc(editor).lineAt(curPos(editor)).number - 1;
  let isFound = false;
  for (; line >= firstLine; line--) {
    const strLine = doc(editor).line(line).text;
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

  const botLine = Math.max(firstLine, line);
  return doc(editor).line(botLine).from;
};

/**
   * return the postion of the EOD(end of drawio)
   * (If the EOD is not found after the cursor or the BOD is found before the EOD, return null)
   */
const getEod = (editor: EditorView) => {
  const lastLine = doc(editor).lines;

  const strLine = doc(editor).lineAt(curPos(editor)).text;
  if (lineEndPartOfDrawioRE.test(strLine)) {
    // get the end of the line where the cursor is located
    return doc(editor).lineAt(curPos(editor)).to;
  }

  let line = doc(editor).lineAt(curPos(editor)).number + 1;
  let isFound = false;
  for (; line <= lastLine; line++) {
    const strLine = doc(editor).line(line).text;
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
  return doc(editor).line(eodLine).to;
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
export const getMarkdownDrawioMxfile = (editor: EditorView): string | undefined | null => {
  if (isInDrawioBlock(editor)) {
    const bod = getBod(editor);
    const eod = getEod(editor);
    if (bod == null || eod == null) {
      return;
    }

    // skip block begin sesion("``` drawio")
    const botLine = doc(editor).lineAt(bod).number + 1;
    // skip block end sesion("```")
    const eodLine = doc(editor).lineAt(eod).number - 1;

    return editor.state.sliceDoc(botLine, eodLine);
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
    beginPos = doc(editor).lineAt(curPos(editor)).from;
    endPos = doc(editor).lineAt(curPos(editor)).to;
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
   * return markdown where the drawioData specified by line number params is replaced to the drawioData specified by drawioData param
   * @param {string} drawioData
   * @param {string} markdown
   * @param beginLineNumber
   * @param endLineNumber
   */
export const replaceDrawioInMarkdown = (drawioData: string, markdown: string, beginLineNumber: number, endLineNumber: number): string => {
  const splitMarkdown = markdown.split(/\r\n|\r|\n/);
  const markdownBeforeDrawio = splitMarkdown.slice(0, beginLineNumber - 1);
  const markdownAfterDrawio = splitMarkdown.slice(endLineNumber);

  let newMarkdown = '';
  if (markdownBeforeDrawio.length > 0) {
    newMarkdown += `${markdownBeforeDrawio.join('\n')}\n`;
  }
  newMarkdown += '``` drawio\n';
  newMarkdown += drawioData;
  newMarkdown += '\n```';
  if (markdownAfterDrawio.length > 0) {
    newMarkdown += `\n${markdownAfterDrawio.join('\n')}`;
  }

  return newMarkdown;
};

/**
   * return an array of the starting line numbers of the drawio sections found in markdown
   */
export const findAllDrawioSection = (editor: EditorView): number[] => {
  const lineNumbers: number[] = [];
  // refs: https://github.com/codemirror/CodeMirror/blob/5.64.0/addon/fold/foldcode.js#L106-L111
  for (let i = 1, e = doc(editor).lines; i <= e; i++) {
    const line = doc(editor).line(i + 1).text;
    const match = lineBeginPartOfDrawioRE.exec(line);
    if (match) {
      lineNumbers.push(i);
    }
  }
  return lineNumbers;
};
