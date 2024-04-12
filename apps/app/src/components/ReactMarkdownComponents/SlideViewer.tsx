import React from 'react';

import dynamic from 'next/dynamic';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import type { RendererOptions } from '~/interfaces/renderer-options';

const Slides = dynamic(() => import('../Presentation/Slides').then(mod => mod.Slides), { ssr: false });

type SlideViewerProps = {
  marp: string | undefined,
  children: string,
  rendererOptions: RendererOptions,
}

export const SlideViewer = React.memo((props: SlideViewerProps) => {
  const {
    marp, children, rendererOptions,
  } = props;

  return (
    <Slides
      hasMarpFlag={marp != null}
      options={{ rendererOptions: rendererOptions as ReactMarkdownOptions }}
    >
      {children}
    </Slides>
  );
});

SlideViewer.displayName = 'SlideViewer';
