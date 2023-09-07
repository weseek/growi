import { jsx as e, jsxs as s } from "react/jsx-runtime";
import { forwardRef as d, useRef as m, useMemo as a } from "react";
import { useCodeMirrorEditorIsolated as c } from "../../stores/codemirror-editor.js";
import { Toolbar as f } from "./Toolbar/Toolbar.js";
import l from "./CodeMirrorEditor.module.scss.js";
const p = d((r, o) => /* @__PURE__ */ e("div", { ...r, className: `flex-expand-vert ${l["codemirror-editor-container"]}`, ref: o })), E = (r) => {
  const {
    editorKey: o,
    onChange: t
  } = r, n = m(null), i = a(() => ({
    onChange: t
  }), [t]);
  return c(o, n.current, i), /* @__PURE__ */ s("div", { className: "flex-expand-vert", children: [
    /* @__PURE__ */ e(p, { ref: n }),
    /* @__PURE__ */ e(f, {})
  ] });
};
export {
  E as CodeMirrorEditor
};
//# sourceMappingURL=CodeMirrorEditor.js.map
