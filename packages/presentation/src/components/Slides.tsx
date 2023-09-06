
import type { PresentationOptions } from '../consts';

import { GrowiSlides } from './GrowiSlides';
import { MarpSlides } from './MarpSlides';

import styles from './Slides.module.scss';

export type SlidesProps = {
  options: PresentationOptions,
  children?: string,
  hasMarpFlag?: boolean,
}

export const Slides = (props: SlidesProps): JSX.Element => {
  const {
    options, children, hasMarpFlag,
  } = props;

  return (
    <div className={`${styles['slides-styles']}`}>
      {
        hasMarpFlag
          ? <MarpSlides>{children}</MarpSlides>
          : <GrowiSlides options={options}>{children}</GrowiSlides>
      }
    </div>
  );
};
