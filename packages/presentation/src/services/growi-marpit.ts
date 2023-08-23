import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';

export const MARP_CONTAINER_CLASS_NAME = 'marpit';

export const slideMarpit = new Marp({
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

export const presentationMarpit = new Marp({
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
