import React from 'react';

import dynamic from 'next/dynamic';

const Slides = dynamic(() => import('./Slides').then(mod => mod.Slides), { ssr: false });

type SlideViewerProps = {
  marp: string,
  children: string,
}

export const SlideViewer: React.FC<SlideViewerProps> = React.memo((props: SlideViewerProps) => {
  const {
    marp, children,
  } = props;

  const options = {
    rendererOptions: {
      children: '',
    },
  };

  return (
    <Slides options={options} hasMarpFlag={marp === 'marp'}>{children}</Slides>
  );
});

SlideViewer.displayName = 'SlideViewer';
