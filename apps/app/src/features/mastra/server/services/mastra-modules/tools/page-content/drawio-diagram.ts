import pako from 'pako';

const MXFILE = /^<mxfile[\s>]/;
const MXGRAPH_MODEL = /<mxGraphModel[\s>]/;
const DIAGRAM_ELEMENT = /<diagram\b[^>]*>([\s\S]*?)<\/diagram>/g;
// A shape with custom properties wraps its <mxCell> in <UserObject>/<object>
// and keeps its text in `label` instead of the cell's `value`. Quoted
// attribute values may contain a literal '>', so they are consumed whole.
const LABELLED_TAG =
  /<(mxCell|UserObject|object)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const LABEL_ATTRIBUTE: Readonly<Record<string, RegExp>> = {
  mxCell: /\svalue\s*=\s*(?:"([^"]*)"|'([^']*)')/,
  UserObject: /\slabel\s*=\s*(?:"([^"]*)"|'([^']*)')/,
  object: /\slabel\s*=\s*(?:"([^"]*)"|'([^']*)')/,
};
const ENTITY = /&(?:#x([0-9a-fA-F]+)|#(\d+)|(amp|lt|gt|quot|apos|nbsp));/g;
const HTML_TAG = /<[^>]*>/g;

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeEntities = (text: string): string =>
  text.replace(
    ENTITY,
    (match, hex: string | undefined, dec: string | undefined, name) => {
      if (name != null) return NAMED_ENTITIES[name] ?? match;
      const codePoint =
        hex != null ? Number.parseInt(hex, 16) : Number(dec ?? '');
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return match;
      }
    },
  );

// Same steps as validateCompressedData in packages/remark-drawio/src/utils/embed.ts.
const inflateCompressedDiagram = (data: string): string => {
  const binary = Buffer.from(data, 'base64').toString('binary');
  const inflated = pako.inflateRaw(
    Uint8Array.from(binary, (c) => c.charCodeAt(0)),
    { to: 'string' },
  );
  return decodeURIComponent(inflated);
};

const toGraphModelXml = (content: string): string => {
  const xml = MXGRAPH_MODEL.test(content)
    ? content
    : inflateCompressedDiagram(content.trim());
  if (!MXGRAPH_MODEL.test(xml)) {
    throw new Error('not a draw.io graph model');
  }
  return xml;
};

// A multi-page <mxfile> holds one <diagram> per page, each either compressed
// or plain XML (see packages/remark-drawio/src/utils/mxfile.ts).
const toGraphModelXmls = (code: string): string[] => {
  const trimmed = code.trim();
  if (!MXFILE.test(trimmed)) {
    return [toGraphModelXml(trimmed)];
  }
  return [...trimmed.matchAll(DIAGRAM_ELEMENT)].map((match) =>
    toGraphModelXml(match[1]),
  );
};

// A cell value is HTML escaped into an XML attribute: unescape the XML, drop
// the tags, then unescape the HTML.
const toPlainLabel = (attributeValue: string): string =>
  decodeEntities(decodeEntities(attributeValue).replace(HTML_TAG, ' '))
    .replace(/\s+/g, ' ')
    .trim();

const collectCellLabels = (xml: string): string[] =>
  [...xml.matchAll(LABELLED_TAG)]
    .map(([, tagName, attributes]) =>
      LABEL_ATTRIBUTE[tagName].exec(` ${attributes}`),
    )
    .map((value) => (value == null ? '' : toPlainLabel(value[1] ?? value[2])))
    .filter((label) => label !== '');

/**
 * One-line stand-in for a ```drawio block: keeps only the text written on
 * the diagram, dropping coordinates and styling.
 */
export const summarizeDrawioDiagram = (code: string): string => {
  let labels: string[];
  try {
    labels = toGraphModelXmls(code).flatMap(collectCellLabels);
  } catch {
    return '[draw.io diagram]';
  }
  const uniqueLabels = [...new Set(labels)];
  return uniqueLabels.length > 0
    ? `[draw.io diagram: ${uniqueLabels.join(' / ')}]`
    : '[draw.io diagram]';
};
