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

describe('summarizeDrawioDiagram', () => {
  it('keeps the cell labels of an uncompressed diagram, with HTML removed', () => {
    expect(summarizeDrawioDiagram(GRAPH_MODEL)).toBe(
      '[draw.io diagram: Web server / DB]',
    );
  });

  it('keeps the cell labels of a compressed diagram', () => {
    expect(summarizeDrawioDiagram(compress(GRAPH_MODEL))).toBe(
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

    expect(summarizeDrawioDiagram(mxfile)).toBe(
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

    expect(summarizeDrawioDiagram(xml)).toBe(
      '[draw.io diagram: Web server / DB]',
    );
  });

  it('falls back to a bare placeholder for data that does not decode', () => {
    expect(summarizeDrawioDiagram('not-a-diagram')).toBe('[draw.io diagram]');
  });
});
