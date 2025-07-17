import React, { useRef, useEffect, type JSX } from 'react';

import mermaid from 'mermaid';
import { v7 as uuidV7 } from 'uuid';

import { useNextThemes } from '~/stores-universal/use-next-themes';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:features:mermaid:MermaidViewer');

type MermaidViewerProps = {
  value: string
}

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
          const id = `mermaid-${uuidV7()}`;
          const { svg } = await mermaid.render(id, value, ref.current);
          ref.current.innerHTML = svg;
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
        <div ref={ref} key={value}>
          {value}
        </div>
      )
      : <div key={value}></div>
  );
});

MermaidViewer.displayName = 'MermaidViewer';
