import React from 'react';

import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import type { PresentationOptions } from '../consts';
import { presentationSlideStyle } from '../interfaces';
import * as extractSections from '../services/renderer/extract-sections';

import './Slides.global.scss';

export const MARP_CONTAINER_CLASS_NAME = 'marpit';


const marp = new Marp({
  container: [
    new Element('div', { class: MARP_CONTAINER_CLASS_NAME }),
    new Element('div', { class: 'slides' }),
  ],
  inlineSVG: false,
  emoji: undefined,
  html: false,
  math: false,
});

// TODO: スライド表示したときのスタイルを整える
// https://redmine.weseek.co.jp/issues/125680
const marpDefaultTheme = marp.themeSet.default;
const marpSlideTheme = marp.themeSet.add(`
    /*!
     * @theme slide_preview
     */
    section {
      max-width: 90%;
    }
`);


type Props = {
  options: PresentationOptions,
  children?: string,
  slideStyle?: presentationSlideStyle,
}

export const Slides = (props: Props): JSX.Element => {
  const { options, children, slideStyle } = props;
  const {
    rendererOptions, isDarkMode, disableSeparationByHeader,
  } = options;

  rendererOptions.remarkPlugins?.push([
    extractSections.remarkPlugin,
    {
      isDarkMode,
      disableSeparationByHeader,
    },
  ]);


  if (slideStyle === 'true') {
    // TODO: スライド表示したときのスタイルを整える
    // https://redmine.weseek.co.jp/issues/125680
    // Presentation と違い RevisionRenderer が Dynamic import ではなく、
    // classname = marpit とできない。
    // RevisionRenderer 内に Slides でスライドを表示するための条件分岐
    marp.themeSet.default = marpSlideTheme;
    const { css } = marp.render('', { htmlAsArray: true });
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
  }

  // TODO: Marp でレンダリングできる
  // https://redmine.weseek.co.jp/issues/115673
  if (slideStyle === 'marp') {
    return (
      <></>
    );
  }


  marp.themeSet.default = marpDefaultTheme;
  const { css } = marp.render('', { htmlAsArray: true });
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
