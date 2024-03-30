import csvToMarkdownTable from 'csv-to-markdown-table';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { gfmTable } from 'micromark-extension-gfm-table';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

type Lang = 'csv' | 'csv-h' | 'tsv' | 'tsv-h';

function isXsv(lang: unknown): lang is Lang {
  return /^(csv|csv-h|tsv|tsv-h)$/.test(lang as string);
}

function rewriteNode(node: Node, lang: Lang) {
  const tableContents = node.value as string;

  const tableDoc = csvToMarkdownTable(
    tableContents,
    lang === 'csv' || lang === 'csv-h' ? ',' : '\t',
    lang === 'csv-h' || lang === 'tsv-h',
  );
  const tableTree = fromMarkdown(tableDoc, {
    extensions: [gfmTable],
    mdastExtensions: [gfmTableFromMarkdown],
  });

  // replace node
  if (tableTree.children[0] != null) {
    node.type = 'table';
    node.children = tableTree.children[0].children;
  }
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (isXsv(node.lang)) {
          rewriteNode(node, node.lang);
        }
      }
    });
  };
};
