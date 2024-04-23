import { Presentation as PresentationSubstance, type PresentationProps as PresentationPropsSubstance } from '@growi/presentation';

import { parseSlideFrontmatterInMarkdown } from '../Page/markdown-slide-util-for-view';

import '@growi/presentation/dist/style.css';

type Props = Omit<PresentationPropsSubstance, 'hasMarpFlag'> & {
  isEnabledMarp: boolean
};

export const Presentation = (props: Props): JSX.Element => {
  const { options, isEnabledMarp, children } = props;

  const [marp] = parseSlideFrontmatterInMarkdown(children ?? '');
  const hasMarpFlag = isEnabledMarp && marp;

  return <PresentationSubstance options={options} hasMarpFlag={hasMarpFlag}>{children}</PresentationSubstance>;
};
