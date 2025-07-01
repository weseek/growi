import React, { useRef, useEffect, type JSX } from 'react';

import mermaid from 'mermaid';

import { useNextThemes } from '~/stores-universal/use-next-themes';

type MermaidViewerProps = {
  value: string
}

export const MermaidViewer = React.memo((props: MermaidViewerProps): JSX.Element => {
  const { value } = props;

  const { isDarkMode } = useNextThemes();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current != null && value != null) {
      mermaid.initialize({
        theme: isDarkMode ? 'dark' : undefined,
      });
      mermaid.run({ nodes: [ref.current] });
    }
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
