import { jsxs as e, jsx as t } from "react/jsx-runtime";
import { useState as s, useCallback as c } from "react";
import { Collapse as i } from "reactstrap";
const r = (n) => {
  const { onClick: o } = n;
  return /* @__PURE__ */ t(
    "button",
    {
      type: "button",
      className: "btn btn-toolbar-button",
      onClick: o,
      children: /* @__PURE__ */ t("span", { className: "material-icons fs-5", children: "text_increase" })
    }
  );
}, d = () => {
  const [n, o] = s(!1), a = c(() => {
    o((l) => !l);
  }, []);
  return /* @__PURE__ */ e("div", { className: "d-flex", children: [
    /* @__PURE__ */ t(r, { isOpen: n, onClick: a }),
    /* @__PURE__ */ t(i, { isOpen: n, horizontal: !0, children: /* @__PURE__ */ e("div", { className: "d-flex px-1 gap-1", style: { width: "220px" }, children: [
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "format_bold" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "format_italic" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "format_strikethrough" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "block" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "code" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "format_list_bulleted" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "format_list_numbered" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "block" }) }),
      /* @__PURE__ */ t("button", { type: "button", className: "btn btn-toolbar-button", children: /* @__PURE__ */ t("span", { className: "material-icons-outlined fs-5", children: "checklist" }) })
    ] }) })
  ] });
};
export {
  d as TextFormatTools
};
//# sourceMappingURL=TextFormatTools.js.map
