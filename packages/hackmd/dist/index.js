import e from "node:fs";
import s from "node:path";
const r = process.env.NODE_ENV === "production", t = r ? "." : "../dist", n = e.readFileSync(s.resolve(__dirname, `${t}/hackmd-styles.js`)), o = e.readFileSync(s.resolve(__dirname, `${t}/hackmd-agent.js`)), i = e.readFileSync(s.resolve(__dirname, `${t}/style.css`)), c = {
  stylesJS: n.toString(),
  agentJS: o.toString(),
  stylesCSS: i.toString().replace(/(\r\n|\n|\r)/gm, "")
  // https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
};
export {
  c as default
};
//# sourceMappingURL=index.js.map
