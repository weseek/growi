import React from 'react';

import dynamic from 'next/dynamic';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

// TODO: Fix Dependency cycle
// https://redmine.weseek.co.jp/issues/126744
// eslint-disable-next-line import/no-cycle
import { usePresentationViewOptions } from '~/stores/renderer';


const Slides = dynamic(() => import('@growi/presentation').then(mod => mod.Slides), { ssr: false });

type SlideViewerProps = {
  marp: string,
  children: string,
}

export const SlideViewer: React.FC<SlideViewerProps> = React.memo((props: SlideViewerProps) => {
  const {
    marp, children,
  } = props;

  const { data: rendererOptions } = usePresentationViewOptions();

  return (
    <Slides
      hasMarpFlag={marp === 'marp'}
      options={{ rendererOptions: rendererOptions as ReactMarkdownOptions }}
    >
      {children}
    </Slides>
  );
});

SlideViewer.displayName = 'SlideViewer';
