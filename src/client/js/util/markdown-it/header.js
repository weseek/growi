export default class HeaderConfigurer {

  constructor(crowi) {
    this.crowi = crowi;

    this.injectRevisionHeadClass = this.injectRevisionHeadClass.bind(this);
  }

  configure(md) {
    const rules = md.renderer.rules;
    const original = rules.heading_open;
    // combine rule and set
    // rules.heading_open = this.combineRules(this.injectRevisionHeadClass, headingOpenOrg);
    rules.heading_open = (tokens, idx, options, env, self) => {
      // Inject 'revision-head' class
      this.injectRevisionHeadClass(tokens, idx, options, env, self);

      if (original) {
        return original(tokens, idx, options, env, self);
      }
      else {
        return self.renderToken(tokens, idx, options, env, self);
      }
    };
  }

  /**
   * Inject 'revision-head' class
   */
  injectRevisionHeadClass(tokens, idx, options, env, slf) {
    if (tokens[idx].map && tokens[idx].level === 0) {
      tokens[idx].attrJoin('class', 'revision-head');
    }
  }
}
