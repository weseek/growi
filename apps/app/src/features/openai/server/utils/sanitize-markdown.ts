import { dynamicImport } from '@cspell/dynamic-import';
import type { Root, Code } from 'mdast';
import type * as RemarkParse from 'remark-parse';
import type * as RemarkStringify from 'remark-stringify';
import type * as Unified from 'unified';
import type * as UnistUtilVisit from 'unist-util-visit';

export const sanitizeMarkdown = async(markdown: string): Promise<string> => {
  const remarkParse = (await dynamicImport<typeof RemarkParse>('remark-parse', __dirname)).default;
  const remarkStringify = (await dynamicImport<typeof RemarkStringify>('remark-stringify', __dirname)).default;
  const unified = (await dynamicImport<typeof Unified>('unified', __dirname)).unified;
  const visit = (await dynamicImport<typeof UnistUtilVisit>('unist-util-visit', __dirname)).visit;

  const sanitize = () => {
    return (tree: Root) => {
      visit(tree, 'code', (node: Code) => {
        if (node.lang === 'drawio') {
          node.value = '{{drawio content}}';
        }
      });
    };
  };

  const processor = unified()
    .use(remarkParse)
    .use(sanitize)
    .use(remarkStringify);

  return processor.processSync(markdown).toString();
};
