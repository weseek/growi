import remarkDirective from 'remark-directive';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, it, expect } from 'vitest';

import { remarkPlugin } from './callout';

describe('remarkPlugin', () => {
  it('should transform containerDirective to callout', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkPlugin);

    const markdown = `
:::info
This is an info callout.
:::
    `;

    const tree = processor.parse(markdown);
    processor.runSync(tree);

    let calloutNode;
    visit(tree, 'callout', (node) => {
      calloutNode = node;
    });

    expect(calloutNode).toBeDefined();
    expect(calloutNode.data.hProperties.type).toBe('info');
    expect(calloutNode.data.hProperties.label).toBe('info');
  });

  //   it('should extract and remove directive label', () => {
  //     const processor = unified()
  //       .use(remarkParse)
  //       .use(remarkDirective)
  //       .use(remarkPlugin);

  //     const markdown = `
  // :::info[custom label]
  // This is an info callout.
  // :::
  //     `;

  //     const tree = processor.parse(markdown);
  //     processor.runSync(tree);

//     const callout = tree.children.find(node => node.type === 'callout');
//     expect(callout).toBeDefined();
//     expect(callout.data.hProperties.label).toBe('Label');
//     expect(callout.children.some(child => child.type === 'paragraph' && (child.children[0] as Text).value === 'Label')).toBe(false);
//   });
});
