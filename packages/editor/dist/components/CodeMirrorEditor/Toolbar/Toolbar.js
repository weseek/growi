import { jsxs as r, jsx as o } from "react/jsx-runtime";
import { memo as t } from "react";
import { AttachmentsDropup as m } from "./AttachmentsDropup.js";
import { DiagramButton as i } from "./DiagramButton.js";
import { EmojiButton as e } from "./EmojiButton.js";
import { TableButton as p } from "./TableButton.js";
import { TemplateButton as a } from "./TemplateButton.js";
import { TextFormatTools as f } from "./TextFormatTools.js";
import l from "./Toolbar.module.scss.js";
const j = t(() => /* @__PURE__ */ r("div", { className: `d-flex gap-2 p-2 codemirror-editor-toolbar ${l["codemirror-editor-toolbar"]}`, children: [
  /* @__PURE__ */ o(m, {}),
  /* @__PURE__ */ o(f, {}),
  /* @__PURE__ */ o(e, {}),
  /* @__PURE__ */ o(p, {}),
  /* @__PURE__ */ o(i, {}),
  /* @__PURE__ */ o(a, {})
] }));
export {
  j as Toolbar
};
//# sourceMappingURL=Toolbar.js.map
