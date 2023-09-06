import React, { ReactNode } from 'react';

type RichSlideSectionProps = {
  children: ReactNode,
}

export const RichSlideSection = React.memo((props: RichSlideSectionProps): JSX.Element => {
  const { children } = props;

  return (
    <section className="shadow rounded m-2">
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
