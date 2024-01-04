
// Ref: https://www.npmjs.com/package/@uiw/codemirror-extensions-classname

import { RangeSetBuilder } from '@codemirror/state';
import {
  EditorView, Decoration, ViewPlugin, DecorationSet, ViewUpdate,
} from '@codemirror/view';

const stripeDeco = (view: EditorView) => {
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = view.state.doc.lineAt(pos);
      const cls = line.number.toString();
      builder.add(
        line.from,
        line.from,
        Decoration.line({
          attributes: { 'data-line': cls },
        }),
      );
      pos = line.to + 1;
    }
  }
  return builder.finish();
};

export const setDataLine = ViewPlugin.fromClass(
  class {

    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = stripeDeco(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = stripeDeco(update.view);
      }
    }

  },
  {
    decorations: v => v.decorations,
  },
);
