import { dynamicImport } from '@cspell/dynamic-import';
import { isPopulated } from '@growi/core';
import type { IPagePopulatedToShowRevision } from '@growi/core/dist/interfaces';
import type { Root, Code } from 'mdast';
import type { HydratedDocument } from 'mongoose';
import type * as RehypeMeta from 'rehype-meta';
import type * as RehypeStringify from 'rehype-stringify';
import type * as RemarkParse from 'remark-parse';
import type * as RemarkRehype from 'remark-rehype';
import type * as Unified from 'unified';
import type * as UnistUtilVisit from 'unist-util-visit';

import type { PageDocument } from '~/server/models/page';

interface ModuleCache {
  unified?: typeof Unified.unified;
  visit?: typeof UnistUtilVisit.visit;
  remarkParse?: typeof RemarkParse.default;
  remarkRehype?: typeof RemarkRehype.default;
  rehypeMeta?: typeof RehypeMeta.default;
  rehypeStringify?: typeof RehypeStringify.default;
}

let moduleCache: ModuleCache = {};

const initializeModules = async(): Promise<void> => {
  if (moduleCache.unified != null
    && moduleCache.visit != null
    && moduleCache.remarkParse != null
    && moduleCache.remarkRehype != null
    && moduleCache.rehypeMeta != null
    && moduleCache.rehypeStringify != null
  ) {
    return;
  }

  const [
    { unified },
    { visit },
    { default: remarkParse },
    { default: remarkRehype },
    { default: rehypeMeta },
    { default: rehypeStringify },
  ] = await Promise.all([
    dynamicImport<typeof Unified>('unified', __dirname),
    dynamicImport<typeof UnistUtilVisit>('unist-util-visit', __dirname),
    dynamicImport<typeof RemarkParse>('remark-parse', __dirname),
    dynamicImport<typeof RemarkRehype>('remark-rehype', __dirname),
    dynamicImport<typeof RehypeMeta>('rehype-meta', __dirname),
    dynamicImport<typeof RehypeStringify>('rehype-stringify', __dirname),
  ]);

  moduleCache = {
    unified,
    visit,
    remarkParse,
    remarkRehype,
    rehypeMeta,
    rehypeStringify,
  };
};

export const convertMarkdownToHtml = async(page: HydratedDocument<PageDocument> | IPagePopulatedToShowRevision): Promise<string> => {
  await initializeModules();

  const {
    unified, visit, remarkParse, remarkRehype, rehypeMeta, rehypeStringify,
  } = moduleCache;

  if (unified == null || visit == null || remarkParse == null || remarkRehype == null || rehypeMeta == null || rehypeStringify == null) {
    throw new Error('Failed to initialize required modules');
  }

  const sanitizeMarkdown = () => {
    return (tree: Root) => {
      visit(tree, 'code', (node: Code) => {
        if (node.lang === 'drawio') {
          node.value = '<!-- drawio content replaced -->';
        }
      });
    };
  };

  const revisionBody = page.revision != null && isPopulated(page.revision)
    ? page.revision.body
    : undefined;

  const processor = unified()
    .use(remarkParse)
    .use(sanitizeMarkdown)
    .use(remarkRehype)
    .use(rehypeMeta, {
      title: page.path,
    })
    .use(rehypeStringify);

  return processor.processSync(revisionBody).toString();
};
