import type { Root } from 'mdast';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

import { summarizeDrawioDiagram } from './drawio-diagram';

const EMBEDDED_IMAGE = '[embedded image]';
const HTML_DATA_IMAGE_URI = /data:image\/[^\s"'<>]+/gi;

type Replacement = {
  readonly start: number;
  readonly end: number;
  readonly text: string;
};

const offsetsOf = (node: Node): [number, number] | null => {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  return start == null || end == null ? null : [start, end];
};

// An html node's `value` drops container prefixes such as `> `, so matches are
// located in the source slice to keep their offsets exact.
const replacementsInHtml = (
  body: string,
  [start, end]: [number, number],
): Replacement[] =>
  [...body.slice(start, end).matchAll(HTML_DATA_IMAGE_URI)].map((match) => ({
    start: start + match.index,
    end: start + match.index + match[0].length,
    text: EMBEDDED_IMAGE,
  }));

const collectReplacements = (body: string, tree: Root): Replacement[] => {
  const replacements: Replacement[] = [];
  visit(tree, (node) => {
    const offsets = offsetsOf(node);
    if (offsets == null) return;
    const [start, end] = offsets;
    if (node.type === 'code' && node.lang === 'drawio') {
      const text = summarizeDrawioDiagram(node.value);
      replacements.push({ start, end, text });
    } else if (node.type === 'image' && node.url.startsWith('data:')) {
      replacements.push({ start, end, text: EMBEDDED_IMAGE });
    } else if (node.type === 'html' && node.value.includes('data:')) {
      replacements.push(...replacementsInHtml(body, offsets));
    }
  });
  return replacements;
};

/**
 * Replaces embedded image data and draw.io diagrams with short stand-ins, in
 * the original source text so the rest of the Markdown is left untouched.
 * `tree` must be the result of parsing `body`.
 */
export const replaceEmbeddedContent = (body: string, tree: Root): string => {
  const replacements = collectReplacements(body, tree).sort(
    (a, b) => a.start - b.start,
  );
  if (replacements.length === 0) return body;

  const pieces: string[] = [];
  let cursor = 0;
  for (const { start, end, text } of replacements) {
    pieces.push(body.slice(cursor, start), text);
    cursor = end;
  }
  pieces.push(body.slice(cursor));
  return pieces.join('');
};
