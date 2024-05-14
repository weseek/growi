import React, { ReactNode } from 'react';

type RichSlideSectionProps = {
  children: ReactNode,
  presentation?: boolean,
}

const OriginalRichSlideSection = React.memo((props: RichSlideSectionProps): JSX.Element => {
  const { children, presentation } = props;

  return (
    <section className={presentation ? 'm-2' : 'shadow rounded m-2'}>
      <svg data-marpit-svg="" viewBox="0 0 1280 720">
        <foreignObject width="1280" height="720">
          <section>
            {children}
          </section>
        </foreignObject>
      </svg>
    </section>
  );
});

export const RichSlideSection = React.memo((props: RichSlideSectionProps): JSX.Element => {
  const { children } = props;

  return (
    <OriginalRichSlideSection>
      {children}
    </OriginalRichSlideSection>
  );
});


export const PresentationRichSlideSection = React.memo((props: RichSlideSectionProps): JSX.Element => {
  const { children } = props;

  return (
    <OriginalRichSlideSection presentation>
      {children}
    </OriginalRichSlideSection>
  );
});
