import { Slides as SlidesSubstance, type SlidesProps } from '@growi/presentation';

import '@growi/presentation/dist/style.css';

export const Slides = (props: SlidesProps): JSX.Element => {
  return <SlidesSubstance {...props} />;
};
