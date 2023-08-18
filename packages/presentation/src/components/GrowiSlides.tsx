import { Marp } from '@marp-team/marp-core';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import type { PresentationOptions } from '../consts';
import * as extractSections from '../services/renderer/extract-sections';

import { RichSlideSection } from './RichSlideSection';

import './Slides.global.scss';

type Props = {
  options: PresentationOptions,
  children?: string,
  marpit: Marp,
}

export const GrowiSlides = (props: Props): JSX.Element => {
  const { options, children, marpit } = props;
  const {
    rendererOptions, isDarkMode, disableSeparationByHeader,
  } = options;

  if (rendererOptions.remarkPlugins != null) {
    rendererOptions.remarkPlugins.push([
      extractSections.remarkPlugin,
      {
        isDarkMode,
        disableSeparationByHeader,
      },
    ]);
  }

  if (rendererOptions.components != null) {
    rendererOptions.components.section = RichSlideSection;
  }

  const { css } = marpit.render('', { htmlAsArray: true });
  return (
    <>
      <Head>
        <style>{css}</style>
      </Head>
      <ReactMarkdown {...rendererOptions}>
        { children ?? '## No Contents' }
      </ReactMarkdown>
    </>
  );

};
