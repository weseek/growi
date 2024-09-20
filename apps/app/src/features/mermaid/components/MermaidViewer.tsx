import type { ReactNode } from 'react';
import React, { useRef, useEffect } from 'react';

import mermaid from 'mermaid';

type MermaidViewerProps = {
  children: ReactNode,
  value: string
}

export const MermaidViewer = React.memo((props: MermaidViewerProps): JSX.Element => {
  const { children, value } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current != null && value != null) {
      mermaid.initialize({});
      mermaid.run({ nodes: [ref.current] });
    }
  }, [value]);

  return (
    children
      ? (
        <div ref={ref} key={children as string}>
          {value}
        </div>
      )
      : <div key={children as string}></div>
  );
});
MermaidViewer.displayName = 'MermaidViewer';
