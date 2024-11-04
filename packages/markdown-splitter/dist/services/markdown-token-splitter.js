import { encodingForModel as M } from "js-tiktoken";
import { splitMarkdownIntoFragments as P } from "./markdown-splitter.js";
function j(l, p) {
  const h = l.map(({ label: i }) => i === "frontmatter" ? "frontmatter" : i.match(/^\d+(?:-\d+)*/)[0]), C = [...new Set(h.filter(Boolean))], d = [];
  let a = [...C];
  for (; a.length > 0; ) {
    const i = a[0];
    if (C.some((s) => s !== i && s.startsWith(i))) {
      let s = l.filter((t) => t.label.startsWith(i));
      const o = i.split("-");
      for (let t = 1; t < o.length; t++) {
        const e = o.slice(0, t).join("-"), r = l.find((c) => c.label === `${e}-heading`);
        r && (s = [r, ...s]);
      }
      if (s.reduce((t, e) => t + e.tokenCount, 0) <= p)
        d.push(s), a = a.filter((t) => !t.startsWith(`${i}-`));
      else {
        const t = l.filter((e) => {
          const r = e.label.match(/^\d+(-\d+)*(?=-)/);
          return r && r[0] === i;
        });
        for (let e = 1; e < o.length; e++) {
          const r = o.slice(0, e).join("-"), c = l.find((g) => g.label === `${r}-heading`);
          c && t.unshift(c);
        }
        d.push(t);
      }
    } else {
      let s = l.filter((n) => n.label.startsWith(i));
      const o = i.split("-");
      for (let n = 1; n < o.length; n++) {
        const t = o.slice(0, n).join("-"), e = l.find((r) => r.label === `${t}-heading`);
        e && (s = [e, ...s]);
      }
      d.push(s);
    }
    a.shift();
  }
  return d;
}
async function F(l, p, h = 800) {
  if (M(p).encode(l).length <= h)
    return [l];
  const d = await P(l, p), a = [];
  return j(d, h).forEach((f) => {
    if (f.reduce((o, n) => o + n.tokenCount, 0) <= h) {
      const o = f.map((n, t) => {
        const e = f[t + 1];
        return e ? n.type === "heading" && e.type === "heading" ? `${n.text}
` : `${n.text}

` : n.text;
      }).join("");
      a.push(o);
    } else {
      const o = f.filter((t) => t.type === "heading"), n = o.map((t) => t.text).join(`
`);
      for (const t of f)
        if (t.label.includes("content")) {
          const e = o.reduce((c, g) => c + g.tokenCount, 0) + t.tokenCount, r = o.reduce((c, g) => c + g.tokenCount, 0);
          if (r > h / 2)
            throw new Error(
              `Heading token count is too large. Heading token count: ${r}, allowed maximum: ${Math.ceil(h / 2)}`
            );
          if (e > h) {
            const c = o.reduce((u, x) => u + x.tokenCount, 0), g = h - c, m = t.text.length, b = t.tokenCount, k = Math.floor(g / b * m), $ = [];
            for (let u = 0; u < t.text.length; u += k)
              $.push(t.text.slice(u, u + k));
            $.forEach((u) => {
              const x = n ? `${n}

${u}` : `${u}`;
              a.push(x);
            });
          } else {
            const c = `${n}

${t.text}`;
            a.push(c);
          }
        }
    }
  }), a;
}
export {
  F as splitMarkdownIntoChunks
};
//# sourceMappingURL=markdown-token-splitter.js.map
