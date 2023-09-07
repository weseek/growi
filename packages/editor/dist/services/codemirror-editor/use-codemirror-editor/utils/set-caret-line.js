import { useCallback as s } from "react";
const a = (t) => s((c) => {
  const o = t == null ? void 0 : t.state.doc;
  if (o == null)
    return;
  const n = o.line(c ?? 1).to;
  t == null || t.dispatch({
    selection: {
      anchor: n,
      head: n
    }
  }), t == null || t.focus();
}, [t]);
export {
  a as useSetCaretLine
};
//# sourceMappingURL=set-caret-line.js.map
