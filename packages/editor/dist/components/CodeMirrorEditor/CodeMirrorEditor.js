import { jsx as t, jsxs as m } from "react/jsx-runtime";
import { forwardRef as u, useRef as p, useMemo as d, useEffect as l } from "react";
import { indentUnit as x } from "../../node_modules/@codemirror/language/dist/index.js";
import { useCodeMirrorEditorIsolated as C } from "../../stores/codemirror-editor.js";
import { Toolbar as v } from "./Toolbar/Toolbar.js";
import R from "./CodeMirrorEditor.module.scss.js";
const h = u((n, r) => /* @__PURE__ */ t("div", { ...n, className: `flex-expand-vert ${R["codemirror-editor-container"]}`, ref: r })), w = (n) => {
  const {
    editorKey: r,
    onChange: s,
    indentSize: o
  } = n, i = p(null), c = d(() => ({
    onChange: s
  }), [s]), { data: e } = C(r, i.current, c);
  return l(() => {
    var a;
    if (o == null)
      return;
    const f = x.of(" ".repeat(o));
    return (a = e == null ? void 0 : e.appendExtensions) == null ? void 0 : a.call(e, f);
  }, [e, o]), /* @__PURE__ */ m("div", { className: "flex-expand-vert", children: [
    /* @__PURE__ */ t(h, { ref: i }),
    /* @__PURE__ */ t(v, {})
  ] });
};
export {
  w as CodeMirrorEditor
};
//# sourceMappingURL=CodeMirrorEditor.js.map
