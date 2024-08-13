import path from 'path';

import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Link } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

declare module 'mdast' {
  interface LinkData {
    hName?: string,
    hProperties?: {
      attachmentId?: string,
      url?: string,
      attachmentName?: PhrasingContent,
    }
  }
}

const SUPPORTED_ATTRIBUTES = ['attachmentId', 'url', 'attachmentName'];

const isAttachmentLink = (url: string): boolean => {
  // https://regex101.com/r/9qZhiK/1
  const attachmentUrlFormat = new RegExp(/^\/(attachment)\/([^/^\n]+)$/);
  return attachmentUrlFormat.test(url);
};

const rewriteNode = (node: Link) => {
  const attachmentId = path.basename(node.url);

  const data = node.data ?? (node.data = {});
  data.hName = 'attachment';
  data.hProperties = {
    attachmentId,
    url: node.url,
    attachmentName: node.children[0] ?? '',
  };
};


export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, 'link', (node: Link) => {
      if (isAttachmentLink(node.url)) {
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
