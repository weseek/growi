import { jsx as m } from "react/jsx-runtime";
import { useEffect as s } from "react";
import { scrollPastEnd as f, keymap as i } from "@codemirror/view";
import { GlobalCodeMirrorEditorKey as u } from "../consts/global-code-mirror-editor-key.js";
import { useCodeMirrorEditorIsolated as r } from "../stores/codemirror-editor.js";
import { CodeMirrorEditor as c } from "./CodeMirrorEditor/CodeMirrorEditor.js";
const x = [
  f()
], D = (a) => {
  const {
    onSave: e,
    onChange: p,
    indentSize: l
  } = a, { data: n } = r(u.MAIN);
  return s(() => {
    var t;
    return (t = n == null ? void 0 : n.appendExtensions) == null ? void 0 : t.call(n, x);
  }, [n]), s(() => {
    var o;
    if (e == null)
      return;
    const t = i.of([
      {
        key: "Mod-s",
        preventDefault: !0,
        run: () => ((n == null ? void 0 : n.getDoc()) != null && e(), !0)
      }
    ]);
    return (o = n == null ? void 0 : n.appendExtensions) == null ? void 0 : o.call(n, t);
  }, [n, e]), /* @__PURE__ */ m(
    c,
    {
      editorKey: u.MAIN,
      onChange: p,
      indentSize: l
    }
  );
};
export {
  D as CodeMirrorEditorMain
};
//# sourceMappingURL=CodeMirrorEditorMain.js.map
