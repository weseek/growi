import { useMemo as f } from "react";
import { indentWithTab as u, defaultKeymap as c } from "../../../node_modules/@codemirror/commands/dist/index.js";
import { markdown as d, markdownLanguage as g } from "@codemirror/lang-markdown";
import { languages as l } from "@codemirror/language-data";
import { Prec as x } from "@codemirror/state";
import { keymap as t } from "@codemirror/view";
import { useCodeMirror as b } from "@uiw/react-codemirror";
import w from "ts-deepmerge";
import { useAppendExtensions as C } from "./utils/append-extensions.js";
import { useFocus as D } from "./utils/focus.js";
import { useGetDoc as E } from "./utils/get-doc.js";
import { useInitDoc as L } from "./utils/init-doc.js";
import { useSetCaretLine as k } from "./utils/set-caret-line.js";
const y = [
  d({ base: g, codeLanguages: l }),
  t.of([u]),
  x.lowest(t.of(c))
], q = (e) => {
  const r = f(() => w(
    e ?? {},
    {
      extensions: y,
      // Reset settings of react-codemirror.
      // The extension defined first will be used, so it must be disabled here.
      indentWithTab: !1,
      basicSetup: {
        defaultKeymap: !1
      }
    }
  ), [e]), { state: s, view: o } = b(r), m = L(o), n = C(o), i = E(o), a = D(o), p = k(o);
  return {
    state: s,
    view: o,
    initDoc: m,
    appendExtensions: n,
    getDoc: i,
    focus: a,
    setCaretLine: p
  };
};
export {
  q as useCodeMirrorEditor
};
//# sourceMappingURL=use-codemirror-editor.js.map
