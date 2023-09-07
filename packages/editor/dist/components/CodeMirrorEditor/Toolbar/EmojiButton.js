import { jsxs as n, Fragment as i, jsx as t } from "react/jsx-runtime";
import { useState as r } from "react";
import { Picker as a } from "../../../node_modules/emoji-mart/dist/module.js";
const u = () => {
  const [o, e] = r(!1);
  return /* @__PURE__ */ n(i, { children: [
    /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", onClick: () => {
      e(!o);
    }, children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-6", children: "emoji_emotions" }) }),
    o && /* @__PURE__ */ t(a, {})
  ] });
};
export {
  u as EmojiButton
};
//# sourceMappingURL=EmojiButton.js.map
