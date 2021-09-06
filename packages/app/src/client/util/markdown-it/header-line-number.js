export default class HeaderLineNumberConfigurer {

  constructor(crowi) {
    this.crowi = crowi;
    this.firstLine = 0;
  }

  configure(md) {
    for (const renderName of ['paragraph_open', 'heading_open', 'image', 'code_block', 'blockquote_open', 'list_item_open']) {
      this.addLineNumberRenderer(md, renderName);
    }
  }

  /**
   * Add line numbers for sync scroll
   * @see https://github.com/Microsoft/vscode/blob/6e8d4d057bd1152d49a1e9780ec6db6363593855/extensions/markdown/src/markdownEngine.ts#L118
   */
  addLineNumberRenderer(md, ruleName) {
    const original = md.renderer.rules[ruleName];
    md.renderer.rules[ruleName] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.map && token.map.length) {
        token.attrSet('data-line', this.firstLine + token.map[0]);
        token.attrJoin('class', 'code-line');
      }

      if (original) {
        return original(tokens, idx, options, env, self);
      }

      return self.renderToken(tokens, idx, options, env, self);
    };
  }

}
