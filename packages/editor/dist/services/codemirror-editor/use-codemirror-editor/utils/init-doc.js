import { useCallback as a } from "react";
import { Transaction as n } from "@codemirror/state";
const c = (o) => a((t) => {
  o == null || o.dispatch({
    changes: {
      from: 0,
      to: o == null ? void 0 : o.state.doc.length,
      insert: t
    },
    annotations: n.addToHistory.of(!1)
  });
}, [o]);
export {
  c as useInitDoc
};
//# sourceMappingURL=init-doc.js.map
