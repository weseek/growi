import pako from 'pako';

import { summarizeDrawioDiagram } from './drawio-diagram';

const GRAPH_MODEL = [
  '<mxGraphModel dx="1000" dy="600" grid="1"><root>',
  '<mxCell id="0" /><mxCell id="1" parent="0" />',
  '<mxCell id="2" value="Web&amp;nbsp;&lt;b&gt;server&lt;/b&gt;" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="10" y="20" width="120" height="60" as="geometry" /></mxCell>',
  '<mxCell id="3" value="DB" style="shape=cylinder;" vertex="1" parent="1"><mxGeometry x="200" y="20" width="60" height="80" as="geometry" /></mxCell>',
  '</root></mxGraphModel>',
].join('');

// The encoding draw.io uses for a compressed diagram.
const compress = (xml: string): string =>
  Buffer.from(pako.deflateRaw(encodeURIComponent(xml))).toString('base64');

// No inflate limit, for tests about what the stand-in says.
const labelsOf = (code: string): string =>
  summarizeDrawioDiagram(code, Number.MAX_SAFE_INTEGER).text;

describe('summarizeDrawioDiagram', () => {
  it('keeps the cell labels of an uncompressed diagram, with HTML removed', () => {
    expect(labelsOf(GRAPH_MODEL)).toBe('[draw.io diagram: Web server / DB]');
  });

  it('keeps the cell labels of a compressed diagram', () => {
    expect(labelsOf(compress(GRAPH_MODEL))).toBe(
      '[draw.io diagram: Web server / DB]',
    );
  });

  it('keeps the labels of every page of a multi-page mxfile', () => {
    const mxfile = [
      '<mxfile>',
      `<diagram id="p1" name="Page-1">${compress(GRAPH_MODEL)}</diagram>`,
      '<diagram id="p2" name="Page-2"><mxGraphModel><root><mxCell id="9" value="Load balancer" vertex="1" /></root></mxGraphModel></diagram>',
      '</mxfile>',
    ].join('');

    expect(labelsOf(mxfile)).toBe(
      '[draw.io diagram: Web server / DB / Load balancer]',
    );
  });

  it('keeps the labels of shapes with custom properties', () => {
    const xml = [
      '<mxGraphModel><root>',
      '<UserObject label="Web server" owner="infra" id="2"><mxCell vertex="1" parent="1" /></UserObject>',
      '<object label="DB" id="3"><mxCell vertex="1" parent="1" /></object>',
      '</root></mxGraphModel>',
    ].join('');

    expect(labelsOf(xml)).toBe('[draw.io diagram: Web server / DB]');
  });

  describe('the inflate limit', () => {
    const MiB = 1024 * 1024;
    // Compresses to a few KB, inflates to about `size` bytes.
    const padded = (label: string, size: number): string =>
      compress(
        `<mxGraphModel><root><mxCell id="2" value="${label}" vertex="1" /></root>${'x'.repeat(size)}</mxGraphModel>`,
      );

    it('falls back to a bare placeholder past the limit, reporting what it inflated', () => {
      const summary = summarizeDrawioDiagram(padded('Huge', 6 * MiB), 5 * MiB);

      expect(summary.text).toBe('[draw.io diagram]');
      expect(summary.inflatedBytes).toBe(5 * MiB);
    });

    it('reports the inflated size of a diagram within the limit', () => {
      const summary = summarizeDrawioDiagram(padded('Small', MiB), 5 * MiB);

      expect(summary.text).toBe('[draw.io diagram: Small]');
      expect(summary.inflatedBytes).toBeGreaterThan(MiB);
      expect(summary.inflatedBytes).toBeLessThan(2 * MiB);
    });

    it('counts the limit across the pages of one mxfile', () => {
      const page = `<diagram id="p">${padded('Half', 3 * MiB)}</diagram>`;

      expect(
        summarizeDrawioDiagram(`<mxfile>${page}</mxfile>`, 5 * MiB).text,
      ).toBe('[draw.io diagram: Half]');
      expect(
        summarizeDrawioDiagram(`<mxfile>${page}${page}</mxfile>`, 5 * MiB).text,
      ).toBe('[draw.io diagram]');
    });
  });

  it('falls back to a bare placeholder for data that does not decode', () => {
    expect(labelsOf('not-a-diagram')).toBe('[draw.io diagram]');
  });
});
