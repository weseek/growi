import type { ChangeSpec, StateCommand } from '@codemirror/state';

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;
const indentAndMarkOnlyRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;

export const insertNewlineContinueMarkup: StateCommand = ({ state, dispatch }) => {

  const changes: ChangeSpec[] = [];

  let selection;

  const curPos = state.selection.main.head;

  const aboveLine = state.doc.lineAt(curPos).number;
  const bolPos = state.doc.line(aboveLine).from;

  const strFromBol = state.sliceDoc(bolPos, curPos);

  if (indentAndMarkOnlyRE.test(strFromBol)) {
    const insert = state.lineBreak;

    changes.push({
      from: bolPos,
      to: curPos,
      insert,
    });
  }

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
    scrollIntoView: true,
    userEvent: 'input',
  }));

  return true;
};
