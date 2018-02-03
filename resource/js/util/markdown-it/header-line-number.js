export default class HeaderLineNumberConfigurer {

  constructor(crowi) {
    this.crowi = crowi;

    this.injectLineNumbers = this.injectLineNumbers.bind(this);
    this.combineRules = this.combineRules.bind(this);
  }

  configure(md) {
    const rules = md.renderer.rules;
    const headingOpenOrg = rules.heading_open;
    const paragraphOpenOrg = rules.paragraph_open;
    // combine rule and set
    rules.heading_open = this.combineRules(this.injectLineNumbers, headingOpenOrg);
    rules.paragraph_open = this.combineRules(this.injectLineNumbers, paragraphOpenOrg);
  }

  /**
   * Inject line numbers for sync scroll
   * @see https://github.com/markdown-it/markdown-it/blob/e6f19eab4204122e85e4a342e0c1c8486ff40c2d/support/demo_template/index.js#L169
   */
  injectLineNumbers(tokens, idx, options, env, slf) {
    var line;
    if (tokens[idx].map && tokens[idx].level === 0) {
      line = tokens[idx].map[0] + 1;    // add 1 to convert to line number
      tokens[idx].attrJoin('class', 'line');
      tokens[idx].attrSet('data-line', String(line));
    }
    return slf.renderToken(tokens, idx, options, env, slf);
  }

  combineRules(rule1, rule2) {
    return (tokens, idx, options, env, slf) => {
      if (rule1 != null) {
        rule1(tokens, idx, options, env, slf);
      }
      if (rule2 != null) {
        rule2(tokens, idx, options, env, slf);
      }
      return slf.renderToken(tokens, idx, options, env, slf);
    }
  }
}
