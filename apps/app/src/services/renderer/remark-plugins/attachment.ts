import path from 'path';

import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['attachmentId', 'url', 'attachmentName', 'isSharedPage'];

const isAttachmentLink = (url: string): boolean => {
  // https://regex101.com/r/9qZhiK/1
  const attachmentUrlFormat = new RegExp(/^\/(attachment)\/([^/^\n]+)$/);
  return attachmentUrlFormat.test(url);
};

const rewriteNode = (node: Node, isSharedPage?: boolean) => {
  const attachmentId = path.basename(node.url as string);
  const data = node.data ?? (node.data = {});
  data.hName = 'attachment';
  data.hProperties = {
    attachmentId,
    url: node.url,
    attachmentName: (node.children as any)[0]?.value,
    isSharedPage: isSharedPage ? 'true' : 'false',
  };
};

type AttachmentPluginParams = {
  isSharedPage?: boolean,
}

export const remarkPlugin: Plugin<[AttachmentPluginParams]> = (options) => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'link') {
        if (isAttachmentLink(node.url as string)) {
          rewriteNode(node, options.isSharedPage);
        }
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
