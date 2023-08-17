import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';

import type { PresentationOptions } from '../consts';

import { GrowiSlides } from './GrowiSlides';
import { MarpSlides } from './MarpSlides';

import './Slides.global.scss';

// TODO: to remove MARP_CONTAINER_CLASS_NAME
// https://redmine.weseek.co.jp/issues/125680
export const MARP_CONTAINER_CLASS_NAME = 'marpit';

const marpit = new Marp({
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

  if (hasMarpFlag) {
    return <MarpSlides marpit={marpit}>{children}</MarpSlides>;
  }

  return <GrowiSlides options={options} marpit={marpit}>{children}</GrowiSlides>;

};
