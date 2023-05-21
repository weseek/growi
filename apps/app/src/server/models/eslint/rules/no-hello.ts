import { Rule } from 'eslint';
import { Literal, TemplateElement } from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
  },
  create: (context: Rule.RuleContext): Rule.RuleListener => {
    return {
      Literal(node: Literal & Rule.NodeParentExtension) {
        if (node.value === 'hello') {
          context.report({ node, message: '"hello" is not allowed' });
        }
      },
      TemplateElement(node: TemplateElement & Rule.NodeParentExtension) {
        if (node.value.cooked === 'hello') {
          context.report({ node, message: '"hello" is not allowed' });
        }
      },
    };
  },
};

export default rule;
