import React from 'react';

import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import type { PresentationOptions } from '../consts';
import * as extractSections from '../services/renderer/extract-sections';

import { RichSlideSection } from './RichSlideSection';

import './Slides.global.scss';

export const MARP_CONTAINER_CLASS_NAME = 'marpit';


const marpSlide = new Marp({
  container: [
    new Element('div', { class: MARP_CONTAINER_CLASS_NAME }),
    new Element('div', { class: 'slides' }),
  ],
  slideContainer: [
    new Element('section', { class: 'shadow rounded m-2' }),
  ],
  inlineSVG: true,
  emoji: undefined,
  html: false,
  math: false,
});

type Props = {
  options: PresentationOptions,
  children?: string,
  hasMarpFlag?: boolean,
}

export const Slides = (props: Props): JSX.Element => {
  const { options, children, hasMarpFlag } = props;
  const {
    rendererOptions, isDarkMode, disableSeparationByHeader,
  } = options;

  if (hasMarpFlag) {
    const { html, css } = marpSlide.render(children ?? '');
    return (
      <>
        <Head>
          <style>{css}</style>
        </Head>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            // DOMpurify.sanitize delete elements in <svg> so sanitize is not used here.
            __html: html,
          }}
        />
      </>
    );
  }

  rendererOptions.remarkPlugins?.push([
    extractSections.remarkPlugin,
    {
      isDarkMode,
      disableSeparationByHeader,
    },
  ]);
  if (rendererOptions.components != null) {
    rendererOptions.components.section = RichSlideSection;
  }

  const { css } = marpSlide.render('');
  return (
    <>
      <Head>
        <style>{css}</style>
      </Head>
      <div className={`${MARP_CONTAINER_CLASS_NAME}`}>
        <div className="slides">
          <ReactMarkdown {...rendererOptions}>
            { children ?? '## No Contents' }
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
};
