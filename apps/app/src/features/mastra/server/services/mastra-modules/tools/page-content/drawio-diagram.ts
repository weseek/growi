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

// Bytes still allowed to be inflated, shared by every diagram it is passed
// through. Counted as the bytes arrive, so a diagram that fails part way
// still uses up what it inflated.
type InflateBudget = { remaining: number };

const inflateRawWithin = (input: Uint8Array, budget: InflateBudget): Buffer => {
  const inflator = new pako.Inflate({ raw: true });
  const chunks: Uint8Array[] = [];
  // Throwing from onData stops pako before it inflates the next chunk.
  inflator.onData = (chunk: Uint8Array) => {
    budget.remaining -= chunk.length;
    if (budget.remaining < 0) {
      throw new Error('draw.io diagram is too large to inflate');
    }
    chunks.push(chunk);
  };
  inflator.push(input, true);
  if (inflator.err !== 0) {
    throw new Error(inflator.msg);
  }
  return Buffer.concat(chunks);
};

// Same decoding as validateCompressedData in packages/remark-drawio/src/utils/embed.ts.
const toGraphModelXml = (content: string, budget: InflateBudget): string => {
  const xml = MXGRAPH_MODEL.test(content)
    ? content
    : decodeURIComponent(
        inflateRawWithin(
          Buffer.from(content.trim(), 'base64'),
          budget,
        ).toString('utf8'),
      );
  if (!MXGRAPH_MODEL.test(xml)) {
    throw new Error('not a draw.io graph model');
  }
  return xml;
};

// A multi-page <mxfile> holds one <diagram> per page, each either compressed
// or plain XML (see packages/remark-drawio/src/utils/mxfile.ts).
const toGraphModelXmls = (code: string, budget: InflateBudget): string[] => {
  const trimmed = code.trim();
  if (!MXFILE.test(trimmed)) {
    return [toGraphModelXml(trimmed, budget)];
  }
  return [...trimmed.matchAll(DIAGRAM_ELEMENT)].map((match) =>
    toGraphModelXml(match[1], budget),
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

type DrawioDiagramSummary = {
  readonly text: string;
  readonly inflatedBytes: number;
};

/**
 * One-line stand-in for a ```drawio block: keeps only the text written on
 * the diagram, dropping coordinates and styling. Compressed diagrams inflate
 * at most `maxInflatedBytes`; past that the bare placeholder is returned.
 */
export const summarizeDrawioDiagram = (
  code: string,
  maxInflatedBytes: number,
): DrawioDiagramSummary => {
  const budget: InflateBudget = { remaining: maxInflatedBytes };
  const inflatedBytes = (): number =>
    Math.min(maxInflatedBytes, maxInflatedBytes - budget.remaining);
  let labels: string[];
  try {
    labels = toGraphModelXmls(code, budget).flatMap(collectCellLabels);
  } catch {
    return { text: '[draw.io diagram]', inflatedBytes: inflatedBytes() };
  }
  const uniqueLabels = [...new Set(labels)];
  const text =
    uniqueLabels.length > 0
      ? `[draw.io diagram: ${uniqueLabels.join(' / ')}]`
      : '[draw.io diagram]';
  return { text, inflatedBytes: inflatedBytes() };
};
