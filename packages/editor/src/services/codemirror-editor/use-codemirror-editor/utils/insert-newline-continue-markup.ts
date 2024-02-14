import type {
  ChangeSpec, StateCommand, EditorState, Transaction,
} from '@codemirror/state';

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;
const indentAndMarkOnlyRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;

export const insertNewlineContinueMarkup = (state: EditorState, dispatch: (transaction: Transaction) => boolean): boolean => {

  const changes: ChangeSpec[] = [];

  let selection;

  const curPos = state.selection.main.head;

  const aboveLine = state.doc.lineAt(curPos).number;
  const bolPos = state.doc.line(aboveLine).from;

  const strFromBol = state.sliceDoc(bolPos, curPos);

  // If the text before the cursor is only markdown symbols
  if (indentAndMarkOnlyRE.test(strFromBol)) {
    const insert = state.lineBreak;

    changes.push({
      from: bolPos,
      to: curPos,
      insert,
    });
  }

  // If the text before the cursor is markdown text
  else if (indentAndMarkRE.test(strFromBol)) {
    const indentAndMark = strFromBol.match(indentAndMarkRE)?.[0];

    if (indentAndMark == null) {
      return false;
    }

    const insert = state.lineBreak + indentAndMark;
    const nextCurPos = curPos + insert.length;

    selection = { anchor: nextCurPos };

    changes.push({
      from: curPos,
      insert,
    });
  }

  // If the text before the cursor is regular text
  else {
    const insert = state.lineBreak;
    const nextCurPos = curPos + insert.length;

    selection = { anchor: nextCurPos };

    changes.push({
      from: curPos,
      insert,
    });
  }

  dispatch(state.update({
    changes,
    selection,
    userEvent: 'input',
  }));

  return true;
};
