import React, { useRef, useEffect, ReactNode } from 'react';

import mermaid from 'mermaid';

type MermaidViewerProps = {
  children: ReactNode,
}

export const MermaidViewer = React.memo((props: MermaidViewerProps): JSX.Element => {
  const { children } = props;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current != null && children != null) {
      mermaid.init({}, ref.current);
    }
  }, [children]);

  return (
    children
      ? <div ref={ref} key={children as string}>
        {children}
      </div>
      : <div key={children as string} />
  );
});
MermaidViewer.displayName = 'MermaidViewer';
