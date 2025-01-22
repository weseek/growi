import { Slides as SlidesSubstance, type SlidesProps } from '@growi/presentation/dist/client';

import '@growi/presentation/dist/style.css';

export const Slides = (props: SlidesProps): React.ReactElement => {
  return <SlidesSubstance {...props} />;
};
