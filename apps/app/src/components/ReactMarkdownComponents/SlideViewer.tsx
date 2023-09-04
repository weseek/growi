import React from 'react';

import dynamic from 'next/dynamic';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import { usePresentationViewOptions } from '~/stores/slide-viewer-renderer';


const Slides = dynamic(() => import('../Presentation/Slides').then(mod => mod.Slides), { ssr: false });

type SlideViewerProps = {
  marp: string | undefined,
  children: string,
}

export const SlideViewer: React.FC<SlideViewerProps> = React.memo((props: SlideViewerProps) => {
  const {
    marp, children,
  } = props;

  const { data: rendererOptions } = usePresentationViewOptions();

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
