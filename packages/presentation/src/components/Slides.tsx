import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';

import type { PresentationOptions } from '../consts';

import { GrowiSlides } from './GrowiSlides';
import { MarpSlides } from './MarpSlides';

import './Slides.global.scss';

const MARP_CONTAINER_CLASS_NAME = 'marpit';

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

  return (
    <div className={`${MARP_CONTAINER_CLASS_NAME}`}>
      <div className="slides">
        {
          hasMarpFlag
            ? <MarpSlides marpit={marpit}>{children}</MarpSlides>
            : <GrowiSlides options={options} marpit={marpit}>{children}</GrowiSlides>
        }
      </div>
    </div>
  );
};
