import React from 'react';

import dynamic from 'next/dynamic';

import { PresentationOptions } from 'src/consts';

const Slides = dynamic(() => import('@growi/presentation').then(mod => mod.Slides), { ssr: false });

type SlideViewerProps = {
  hasMarpFlag: boolean,
  children: string,
}

export const SldieViewer: React.FC<SlideViewerProps> = React.memo((props: SlideViewerProps): JSX.Element => {
  const {
    hasMarpFlag, children,
  } = props;

  console.log(children);

  const options: PresentationOptions = {
    rendererOptions: {
      children: '',
    },
  };

  return (
    <Slides options={options} hasMarpFlag={hasMarpFlag}>{children}</Slides>
  );
});
