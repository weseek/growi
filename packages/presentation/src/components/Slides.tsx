
import type { PresentationOptions } from '../consts';

import { GrowiSlides } from './GrowiSlides';
import { MarpSlides } from './MarpSlides';

import './Slides.global.scss';

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

  return (
    hasMarpFlag
      ? <MarpSlides presentation={presentation}>{children}</MarpSlides>
      : <GrowiSlides options={options} presentation={presentation}>{children}</GrowiSlides>
  );
};
