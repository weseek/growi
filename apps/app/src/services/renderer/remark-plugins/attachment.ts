import path from 'path';

import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['attachmentId', 'url', 'attachmentName'];

const isAttachmentLink = (url: string): boolean => {
  // https://regex101.com/r/9qZhiK/1
  const attachmentUrlFormat = new RegExp(/^\/(attachment)\/([^/^\n]+)$/);
  return attachmentUrlFormat.test(url);
};

const rewriteNode = (node: Node) => {
  const attachmentId = path.basename(node.url as string);

  node.data = {
    ...(node.data ?? {}),
    hName: 'attachment',
    hProperties: {
      attachmentId,
      url: node.url,
      attachmentName: (node.children as any)[0]?.value,
    },
  };
};

export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, 'link', (node: Node) => {
      if (isAttachmentLink(node.url as string)) {
        rewriteNode(node);
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['attachment'],
  attributes: {
    attachment: SUPPORTED_ATTRIBUTES,
  },
};
