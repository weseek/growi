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
  remarkParse?: typeof RemarkParse.default;
  unified?: typeof Unified.unified;
  visit?: typeof UnistUtilVisit.visit;
  remarkRehype?: typeof RemarkRehype.default;
  rehypeMeta?: typeof RehypeMeta.default;
  rehypeStringify?: typeof RehypeStringify.default;
}

let moduleCache: ModuleCache = {};

const initializeModules = async(): Promise<void> => {
  if (moduleCache.remarkParse != null
    && moduleCache.unified != null
    && moduleCache.visit != null
    && moduleCache.remarkRehype != null
    && moduleCache.rehypeMeta != null
    && moduleCache.rehypeStringify != null
  ) {
    return;
  }

  const [
    { default: remarkParse },
    { unified }, { visit },
    { default: remarkRehype },
    { default: rehypeMeta },
    { default: rehypeStringify },
  ] = await Promise.all([
    dynamicImport<typeof RemarkParse>('remark-parse', __dirname),
    dynamicImport<typeof Unified>('unified', __dirname),
    dynamicImport<typeof UnistUtilVisit>('unist-util-visit', __dirname),
    dynamicImport<typeof RemarkRehype>('remark-rehype', __dirname),
    dynamicImport<typeof RehypeMeta>('rehype-meta', __dirname),
    dynamicImport<typeof RehypeStringify>('rehype-stringify', __dirname),
  ]);

  moduleCache = {
    remarkParse,
    unified,
    visit,
    remarkRehype,
    rehypeMeta,
    rehypeStringify,
  };
};

export const convertMarkdownToHtml = async(page: HydratedDocument<PageDocument> | IPagePopulatedToShowRevision): Promise<string> => {
  await initializeModules();

  const {
    remarkParse,
    unified, visit,
    remarkRehype,
    rehypeMeta,
    rehypeStringify,
  } = moduleCache;

  if (remarkParse == null
    || unified == null
    || visit == null
    || remarkRehype == null
    || rehypeMeta == null
    || rehypeStringify == null) {
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


  const revisionBody = page.revision != null && isPopulated(page.revision) ? page.revision.body : undefined;

  const processor = unified()
    .use(remarkParse)
    .use(sanitize)
    .use(remarkRehype)
    .use(rehypeMeta, {
      title: page.path,
    })
    .use(rehypeStringify);

  return processor.processSync(revisionBody).toString();
};
