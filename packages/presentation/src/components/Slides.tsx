import type { PresentationOptions } from '../consts';

import { GrowiSlides } from './GrowiSlides';
import { MarpSlides } from './MarpSlides';

import './Slides.global.scss';

// TODO: to remove MARP_CONTAINER_CLASS_NAME
// https://redmine.weseek.co.jp/issues/125680
export const MARP_CONTAINER_CLASS_NAME = 'marpit';

type Props = {
  options: PresentationOptions,
  children?: string,
  hasMarpFlag?: boolean,
}

export const Slides = (props: Props): JSX.Element => {
  const { options, children, hasMarpFlag } = props;

  if (hasMarpFlag) {
    return <MarpSlides>{children}</MarpSlides>;
  }

  return <GrowiSlides options={options}>{children}</GrowiSlides>;

};
