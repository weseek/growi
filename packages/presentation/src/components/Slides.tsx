import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';

import type { PresentationOptions } from '../consts';

import { GrowiSlides } from './GrowiSlides';
import { MarpSlides } from './MarpSlides';

import './Slides.global.scss';

const MARP_CONTAINER_CLASS_NAME = 'marpit';

const marpit = new Marp({
  container: [
    new Element('div', { class: `slides ${MARP_CONTAINER_CLASS_NAME}` }),
  ],
  slideContainer: [
    new Element('section', { class: 'shadow rounded m-2' }),
  ],
  inlineSVG: true,
  emoji: undefined,
  html: false,
  math: false,
});

const presentationMarpit = new Marp({
  container: [
    new Element('div', { class: `slides ${MARP_CONTAINER_CLASS_NAME}` }),
  ],
  slideContainer: [
    new Element('section', { class: 'm-2' }),
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
  presentation?: boolean,
}

export const Slides = (props: Props): JSX.Element => {
  const {
    options, children, hasMarpFlag, presentation,
  } = props;

  if (hasMarpFlag) {
    return <MarpSlides marpit={presentation ? presentationMarpit : marpit}>{children}</MarpSlides>;
  }
  return (
    <div className={`slides ${MARP_CONTAINER_CLASS_NAME}`}>
      <GrowiSlides options={options} marpit={presentation ? presentationMarpit : marpit} presentation={presentation}>{children}</GrowiSlides>
    </div>
  );
};
