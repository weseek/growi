import React from 'react';

import { MARP_CONTAINER_CLASS_NAME } from '@growi/presentation';
import dynamic from 'next/dynamic';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import { usePresentationViewOptions } from './SlideViewerRenderer';


const Slides = dynamic(() => import('@growi/presentation').then(mod => mod.Slides), { ssr: false });

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
    <div className={`${MARP_CONTAINER_CLASS_NAME}`}>
      <div className="slides">
        <Slides
          hasMarpFlag={marp != null}
          options={{ rendererOptions: rendererOptions as ReactMarkdownOptions }}
        >
          {children}
        </Slides>
      </div>
    </div>
  );
});

SlideViewer.displayName = 'SlideViewer';
