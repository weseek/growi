/**
 * @typedef {import('eslint').Rule} Rule
 * @typedef {import('./lib/html.js').HtmlOptions} HtmlOptions
 */

/** @type {Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
  },
  /**
   * @property {Rule.RuleContext} context
   * @return {Rule.RuleListener}
   */
  create: (context) => {
    return {
      Literal(node) {
        if (node.value === 'hello') {
          context.report({ node, message: '"hello" is not allowed' });
        }
      },
      TemplateElement(node) {
        if (node.value.cooked === 'hello') {
          context.report({ node, message: '"hello" is not allowed' });
        }
      },
    };
  },
};
