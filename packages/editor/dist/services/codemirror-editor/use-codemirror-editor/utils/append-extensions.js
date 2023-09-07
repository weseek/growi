import { useCallback as f } from "react";
import { Compartment as p, StateEffect as s } from "@codemirror/state";
const m = (t) => f((n) => {
  const o = Array.isArray(n) ? n : [n], r = new p();
  return t == null || t.dispatch({
    effects: o.map((e) => s.appendConfig.of(
      r.of(e)
    ))
  }), () => {
    t == null || t.dispatch({
      effects: r.reconfigure([])
    });
  };
}, [t]);
export {
  m as useAppendExtensions
};
//# sourceMappingURL=append-extensions.js.map
