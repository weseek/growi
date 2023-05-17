import { Presentation as PresentationSubstance, type PresentationProps } from '@growi/presentation';

import '@growi/presentation/dist/style.css';

export const Presentation = (props: PresentationProps): JSX.Element => {
  return <PresentationSubstance {...props} />;
};
