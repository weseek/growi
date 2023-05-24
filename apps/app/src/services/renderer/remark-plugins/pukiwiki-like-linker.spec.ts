import { describe, test, expect } from 'vitest';

import { HastNode, selectAll } from 'hast-util-select';
import parse from 'remark-parse';
import rehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { relativeLinksByPukiwikiLikeLinker } from '../rehype-plugins/relative-links-by-pukiwiki-like-linker';
import { pukiwikiLikeLinker } from './pukiwiki-like-linker';

describe('pukiwikiLikeLinker', () => {

  /* eslint-disable indent */
  describe.each`
    input                                   | expectedHref                | expectedValue
    ${'[[/page]]'}                          | ${'/page'}                  | ${'/page'}
    ${'[[./page]]'}                         | ${'./page'}                 | ${'./page'}
    ${'[[Title>./page]]'}                   | ${'./page'}                 | ${'Title'}
    ${'[[Title>https://example.com]]'}      | ${'https://example.com'}    | ${'Title'}
  `('should parse correctly', ({ input, expectedHref, expectedValue }) => {
  /* eslint-enable indent */

    test(`when the input is '${input}'`, () => {
      // setup:
      const processor = unified()
        .use(parse)
        .use(pukiwikiLikeLinker);

      // when:
      const ast = processor.parse(input);

      expect(ast).not.toBeNull();

      visit(ast, 'wikiLink', (node: any) => {
        expect(node.data.alias).toEqual(expectedValue);
        expect(node.data.permalink).toEqual(expectedHref);
        expect(node.data.hName).toEqual('a');
        expect(node.data.hProperties.className.startsWith('pukiwiki-like-linker')).toBeTruthy();
        expect(node.data.hProperties.href).toEqual(expectedHref);
        expect(node.data.hChildren[0].value).toEqual(expectedValue);
      });

    });
  });

});


describe('relativeLinksByPukiwikiLikeLinker', () => {

  /* eslint-disable indent */
  describe.each`
    input                                   | expectedHref                | expectedValue
    ${'[[/page]]'}                          | ${'/page'}                  | ${'/page'}
    ${'[[./page]]'}                         | ${'/user/admin/page'}       | ${'./page'}
    ${'[[Title>./page]]'}                   | ${'/user/admin/page'}       | ${'Title'}
    ${'[[Title>https://example.com]]'}      | ${'https://example.com'}    | ${'Title'}
  `('should convert relative links correctly', ({ input, expectedHref, expectedValue }) => {
  /* eslint-enable indent */

    test(`when the input is '${input}'`, () => {
      // setup:
      const processor = unified()
        .use(parse)
        .use(pukiwikiLikeLinker)
        .use(rehype)
        .use(relativeLinksByPukiwikiLikeLinker, { pagePath: '/user/admin' });

      // when:
      const mdast = processor.parse(input);
      const hast = processor.runSync(mdast);

      expect(hast).not.toBeNull();
      expect((hast as any).children[0].type).toEqual('element');

      const anchors = selectAll('a', hast as HastNode);

      expect(anchors.length).toEqual(1);

      const anchor = anchors[0];

      expect(anchor.tagName).toEqual('a');
      expect((anchor.properties as any).className.startsWith('pukiwiki-like-linker')).toBeTruthy();
      expect(anchor.properties?.href).toEqual(expectedHref);

      expect(anchor.children[0]).not.toBeNull();
      expect(anchor.children[0].type).toEqual('text');
      expect(anchor.children[0].value).toEqual(expectedValue);

    });
  });

});
