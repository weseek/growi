import { encodingForModel as C } from "js-tiktoken";
import F from "js-yaml";
import m from "remark-frontmatter";
import p from "remark-gfm";
import M from "remark-parse";
import S from "remark-stringify";
import { unified as u } from "unified";
function $(t, n) {
  if (n > t.length)
    for (; t.length < n; )
      t.push(1);
  else n === t.length || t.splice(n), t[n - 1]++;
  return t.join("-");
}
async function G(t, n) {
  const s = [], y = [];
  let i = "";
  const l = {};
  if (typeof t != "string" || t.trim() === "")
    return s;
  const f = C(n), g = u().use(M).use(m, ["yaml"]).use(p), d = {
    bullet: "-",
    // Set list bullet to hyphen
    rule: "-"
    // Use hyphen for horizontal rules
  }, a = u().use(m, ["yaml"]).use(p).use(S, d), k = g.parse(t);
  for (const o of k.children)
    if (o.type === "yaml") {
      const r = F.load(o.value), e = JSON.stringify(r, null, 2), c = f.encode(e).length;
      s.push({
        label: "frontmatter",
        type: "yaml",
        text: e,
        tokenCount: c
      });
    } else if (o.type === "heading") {
      const r = o.depth;
      i = $(y, r);
      const e = a.stringify(o).trim(), c = f.encode(e).length;
      s.push({
        label: `${i}-heading`,
        type: o.type,
        text: e,
        tokenCount: c
      });
    } else {
      const r = a.stringify(o).trim();
      if (r !== "") {
        const e = i || "0";
        l[e] ? l[e]++ : l[e] = 1;
        const c = i !== "" ? `${i}-content-${l[e]}` : `0-content-${l[e]}`, h = f.encode(r).length;
        s.push({
          label: c,
          type: o.type,
          text: r,
          tokenCount: h
        });
      }
    }
  return s;
}
export {
  G as splitMarkdownIntoFragments
};
//# sourceMappingURL=markdown-splitter.js.map
