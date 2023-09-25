import { useRef as c, useMemo as d } from "react";
import { useSWRStatic as m } from "../packages/core/dist/swr/use-swr-static.js";
import a from "ts-deepmerge";
import { useCodeMirrorEditor as f } from "../services/codemirror-editor/use-codemirror-editor/use-codemirror-editor.js";
const p = (r) => r.state != null && r.view != null, y = (r, e) => Object.keys(r).every((t) => r[t] === e[t]), w = (r, e, o) => {
  const t = c(), s = t.current, i = r != null ? `codeMirrorEditor_${r}` : null, u = d(() => a(
    o ?? {},
    {
      container: e
    }
  ), [e, o]), n = f(u), l = i != null && e != null && o != null && (s == null || p(n) && !y(s, n));
  return l && (t.current = n, console.info("Initializing codemirror for main")), m(i, l ? n : void 0);
};
export {
  w as useCodeMirrorEditorIsolated
};
//# sourceMappingURL=codemirror-editor.js.map
