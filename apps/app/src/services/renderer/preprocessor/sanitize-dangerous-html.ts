import { fromHtml } from 'hast-util-from-html';
import { sanitize } from 'hast-util-sanitize';
import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';

import { tagNames, attributes } from '~/services/renderer/recommended-whitelist';

export function sanitizeIframeSrcdocHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return markdown;
  }

  const tree = fromHtml(markdown, { fragment: true });

  visit(tree, 'element', (node) => {
    if (node.tagName === 'iframe' && typeof node.properties?.srcdoc === 'string') {
      const originalSrcdoc = node.properties.srcdoc as string;
      const parsed = fromHtml(originalSrcdoc, { fragment: true });
      const sanitized = sanitize(parsed, { tagNames, attributes });
      node.properties.srcdoc = toHtml(sanitized);
    }
  });

  return toHtml(tree);
}
