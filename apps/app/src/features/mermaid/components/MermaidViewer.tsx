import React, { useRef, useEffect, type JSX } from 'react';

import mermaid, { type DetailedError } from 'mermaid';
import dedent from 'ts-dedent';
import { v7 as uuidV7 } from 'uuid';

import { useNextThemes } from '~/stores-universal/use-next-themes';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:features:mermaid:MermaidViewer');

type MermaidViewerProps = {
  value: string
}

let decoder: HTMLDivElement;

/**
 * Decodes HTML, source: {@link https://github.com/shrpne/entity-decode/blob/v2.0.1/browser.js}
 *
 * @param html - HTML as a string
 * @returns Unescaped HTML
 */
const entityDecode = (html: string): string => {
  decoder = decoder || document.createElement('div');
  // Escape HTML before decoding for HTML Entities
  html = escape(html).replace(/%26/g, '&').replace(/%23/g, '#').replace(/%3B/g, ';');
  decoder.innerHTML = html;

  return unescape(decoder.textContent!);
};

const renderMermaidDiagram = async(node: HTMLElement) => {
  const errors: DetailedError[] = [];
  let txt: string;

  /*! Check if previously processed */
  if (node.getAttribute('data-processed') != null) {
    return;
  }

  node.setAttribute('data-processed', 'true');

  // Fetch the graph definition including tags
  txt = node.innerHTML;

  // transforms the html to pure text
  txt = dedent(entityDecode(txt)) // removes indentation, required for YAML parsing
    .trim()
    .replace(/<br\s*\/?>/gi, '<br/>');


  try {
    const id = `mermaid-${uuidV7()}`;
    const { svg, bindFunctions } = await mermaid.render(id, txt, node);
    node.innerHTML = svg;
    if (bindFunctions != null) {
      bindFunctions(node);
    }
  }
  catch (error) {
    logger.error('Error rendering diagram', error);
  }

  if (errors.length > 0) {
    // TODO: We should be throwing an error object.
    throw errors[0];
  }
};

export const MermaidViewer = React.memo((props: MermaidViewerProps): JSX.Element => {
  const { value } = props;

  const { isDarkMode } = useNextThemes();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async() => {
      if (ref.current != null && value != null) {
        mermaid.initialize({
          theme: isDarkMode ? 'dark' : undefined,
        });
        try {
          await renderMermaidDiagram(ref.current);
        }
        catch (err) {
          logger.error(err);
        }
      }
    })();

  }, [isDarkMode, value]);

  return (
    value
      ? (
        <div ref={ref} key={value as string}>
          {value}
        </div>
      )
      : <div key={value as string}></div>
  );
});
MermaidViewer.displayName = 'MermaidViewer';
