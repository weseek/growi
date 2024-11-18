import { dynamicImport } from '@cspell/dynamic-import';
import type { Root, Code } from 'mdast';
import type * as RemarkParse from 'remark-parse';
import type * as RemarkStringify from 'remark-stringify';
import type * as Unified from 'unified';
import type * as UnistUtilVisit from 'unist-util-visit';

interface ModuleCache {
  remarkParse?: typeof RemarkParse.default;
  remarkStringify?: typeof RemarkStringify.default;
  unified?: typeof Unified.unified;
  visit?: typeof UnistUtilVisit.visit;
}

let moduleCache: ModuleCache = {};

const initializeModules = async(): Promise<void> => {
  if (moduleCache.remarkParse != null && moduleCache.remarkStringify != null && moduleCache.unified != null && moduleCache.visit != null) {
    return;
  }

  const [{ default: remarkParse }, { default: remarkStringify }, { unified }, { visit }] = await Promise.all([
    dynamicImport<typeof RemarkParse>('remark-parse', __dirname),
    dynamicImport<typeof RemarkStringify>('remark-stringify', __dirname),
    dynamicImport<typeof Unified>('unified', __dirname),
    dynamicImport<typeof UnistUtilVisit>('unist-util-visit', __dirname),
  ]);

  moduleCache = {
    remarkParse,
    remarkStringify,
    unified,
    visit,
  };
};

export const sanitizeMarkdown = async(markdown: string): Promise<string> => {
  await initializeModules();

  const {
    remarkParse, remarkStringify, unified, visit,
  } = moduleCache;


  if (remarkParse == null || remarkStringify == null || unified == null || visit == null) {
    throw new Error('Failed to initialize required modules');
  }

  const sanitize = () => {
    return (tree: Root) => {
      visit(tree, 'code', (node: Code) => {
        if (node.lang === 'drawio') {
          node.value = '<!-- drawio content replaced -->';
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
