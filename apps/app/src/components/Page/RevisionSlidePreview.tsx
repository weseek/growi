
import React from 'react';

import { MARP_CONTAINER_CLASS_NAME, Slides } from '@growi/presentation';
import { Head } from 'next/head';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';

import 'katex/dist/katex.min.css';


const logger = loggerFactory('components:Page:RevisionSlidePreview');


type Props = {
  rendererOptions: RendererOptions,
  markdown: string,
  slideStyle: string,
}
export const RevisionSlidePreview = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, slideStyle,
  } = props;

  const options = {
    rendererOptions: rendererOptions as ReactMarkdownOptions,
    isDarkMode: false,
    disableSeparationsByHeader: false,
  };
  if (slideStyle === 'true') {
    return (
      <div className={`${MARP_CONTAINER_CLASS_NAME}`}>
        <div className = "slides">
          <Slides options={options}>{markdown}</Slides>
        </div>
      </div>
    );
  }
  if (slideStyle === 'marp') {
    return (
      <></>
    );
  }

  return (
    <></>
  );

});
RevisionSlidePreview.displayName = 'RevisionSlidePreview';
