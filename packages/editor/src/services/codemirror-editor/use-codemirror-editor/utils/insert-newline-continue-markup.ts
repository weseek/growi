import type { ChangeSpec, StateCommand } from '@codemirror/state';

// https://regex101.com/r/7BN2fR/5
const indentAndMarkRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]\s|[*+-]\s|(\d+)([.)]))(\s*)/;
const indentAndMarkOnlyRE = /^(\s*)(>[> ]*|[*+-] \[[x ]\]|[*+-]|(\d+)[.)])(\s*)$/;

export const insertNewlineContinueMarkup: StateCommand = ({ state, dispatch }) => {

  const changes: ChangeSpec[] = [];
  let insert: string;
  let nextCurPos: number;

  const curPos = state.selection.main.head;

  const aboveLine = state.doc.lineAt(curPos).number;
  const bolPos = state.doc.line(aboveLine).from;

  const strFromBol = state.sliceDoc(bolPos, curPos);

  if (indentAndMarkOnlyRE.test(strFromBol)) {
    insert = state.lineBreak;
    nextCurPos = curPos + insert.length;

    changes.push({
      from: bolPos,
      to: nextCurPos,
      insert,
    });
  }

  else if (indentAndMarkRE.test(strFromBol)) {
    const indentAndMark = strFromBol.match(indentAndMarkRE)?.[0];

    if (indentAndMark == null) {
      return false;
    }

    insert = indentAndMark;
    nextCurPos = curPos + insert.length + 1;

    changes.push({
      from: curPos,
      insert,
    });
  }

  else {
    insert = state.lineBreak;
    nextCurPos = curPos + insert.length;

    changes.push({
      from: curPos,
      insert,
    });
  }

  dispatch(state.update({
    changes,
    selection: { anchor: nextCurPos },
    scrollIntoView: true,
    userEvent: 'input',
  }));

  return true;
};
