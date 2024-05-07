import React from 'react';

import dynamic from 'next/dynamic';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import { usePresentationViewOptions } from '~/stores/renderer';

const Slides = dynamic(() => import('./Presentation/Slides').then(mod => mod.Slides), { ssr: false });

type SlideViewerProps = {
  marp: boolean,
  children: string,
}

export const SlideViewer = React.memo((props: SlideViewerProps) => {
  const {
    marp, children,
  } = props;

  const { data: rendererOptions } = usePresentationViewOptions();

  return (
    <Slides
      hasMarpFlag={marp}
      options={{ rendererOptions: rendererOptions as ReactMarkdownOptions }}
    >
      {children}
    </Slides>
  );
});

SlideViewer.displayName = 'SlideViewer';
