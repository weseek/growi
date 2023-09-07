import { useMemo as u } from "react";
import { markdown as p, markdownLanguage as a } from "@codemirror/lang-markdown";
import { languages as f } from "@codemirror/language-data";
import { useCodeMirror as d } from "@uiw/react-codemirror";
import g from "ts-deepmerge";
import { useAppendExtensions as x } from "./utils/append-extensions.js";
import { useFocus as C } from "./utils/focus.js";
import { useGetDoc as D } from "./utils/get-doc.js";
import { useInitDoc as E } from "./utils/init-doc.js";
import { useSetCaretLine as L } from "./utils/set-caret-line.js";
const w = [
  p({ base: a, codeLanguages: f })
], S = (e) => {
  const r = u(() => g(
    e ?? {},
    { extensions: w }
  ), [e]), { state: t, view: o } = d(r), s = E(o), n = x(o), m = D(o), i = C(o), c = L(o);
  return {
    state: t,
    view: o,
    initDoc: s,
    appendExtensions: n,
    getDoc: m,
    focus: i,
    setCaretLine: c
  };
};
export {
  S as useCodeMirrorEditor
};
//# sourceMappingURL=use-codemirror-editor.js.map
