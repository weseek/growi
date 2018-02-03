export default class HeaderConfigurer {

  constructor(crowi) {
    this.crowi = crowi;

    this.injectRevisionHeadClass = this.injectRevisionHeadClass.bind(this);
    this.combineRules = this.combineRules.bind(this);
  }

  configure(md) {
    const rules = md.renderer.rules;
    const headingOpenOrg = rules.heading_open;
    // combine rule and set
    rules.heading_open = this.combineRules(this.injectRevisionHeadClass, headingOpenOrg);
  }

  /**
   * Inject 'revision-head' class
   */
  injectRevisionHeadClass(tokens, idx, options, env, slf) {
    if (tokens[idx].map && tokens[idx].level === 0) {
      tokens[idx].attrJoin('class', 'revision-head');
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
