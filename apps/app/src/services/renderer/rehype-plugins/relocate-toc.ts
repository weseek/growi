import rehypeToc, { type HtmlElementNode } from 'rehype-toc';
import type { Plugin } from 'unified';
import type { Node } from 'unist';

type StoreTocPluginParams = {
  storeTocNode: (toc: HtmlElementNode) => void,
}

export const rehypePluginStore: Plugin<[StoreTocPluginParams]> = (options) => {
  return rehypeToc.bind(this)({
    nav: false,
    headings: ['h1', 'h2', 'h3'],
    customizeTOC: (toc: HtmlElementNode) => {
      // For storing tocNode to global state with swr
      // search: tocRef.current
      options.storeTocNode(toc);

      return false; // not show toc in body
    },
  });
};


// method for replace <ol> to <ul>
const replaceOlToUl = (children: Node[]) => {
  children.forEach((child) => {
    if (child.type === 'element' && child.tagName === 'ol') {
      child.tagName = 'ul';
    }
    if (child.children != null) {
      replaceOlToUl(child.children as Node[]);
    }
  });
};

type RestoreTocPluginParams = {
  tocNode?: HtmlElementNode,
}

export const rehypePluginRestore: Plugin<[RestoreTocPluginParams]> = (options) => {
  const { tocNode } = options;

  return rehypeToc.bind(this)({
    headings: ['h1', 'h2', 'h3'],
    customizeTOC: () => {
      if (tocNode != null) {
        replaceOlToUl([tocNode]); // replace <ol> to <ul>

        // restore toc
        return tocNode;
      }
    },
  });
};
