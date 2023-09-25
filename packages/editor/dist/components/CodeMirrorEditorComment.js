import { jsx as a } from "react/jsx-runtime";
import { useEffect as s } from "react";
import { scrollPastEnd as l, keymap as f } from "@codemirror/view";
import { GlobalCodeMirrorEditorKey as m } from "../consts/global-code-mirror-editor-key.js";
import { useCodeMirrorEditorIsolated as r } from "../stores/codemirror-editor.js";
import { CodeMirrorEditor as C } from "./CodeMirrorEditor/CodeMirrorEditor.js";
import "./CodeMirrorEditorMain.js";
const i = [
  l()
], N = (p) => {
  const {
    onComment: e,
    onChange: u
  } = p, { data: n } = r(m.COMMENT);
  return s(() => {
    var t;
    return (t = n == null ? void 0 : n.appendExtensions) == null ? void 0 : t.call(n, i);
  }, [n]), s(() => {
    var o;
    if (e == null)
      return;
    const t = f.of([
      {
        key: "Mod-Enter",
        preventDefault: !0,
        run: () => ((n == null ? void 0 : n.getDoc()) != null && e(), !0)
      }
    ]);
    return (o = n == null ? void 0 : n.appendExtensions) == null ? void 0 : o.call(n, t);
  }, [n, e]), /* @__PURE__ */ a(
    C,
    {
      editorKey: m.COMMENT,
      onChange: u
    }
  );
};
export {
  N as CodeMirrorEditorComment
};
//# sourceMappingURL=CodeMirrorEditorComment.js.map
