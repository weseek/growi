import { useRef } from 'react';

import { useInlineComments } from '../../stores/inline-comments';

import { InlineComment } from './InlineComment';

export const InlineCommentsContainer = (): JSX.Element => {

  const { data: inlineComments = [] } = useInlineComments();

  const ref = useRef<HTMLDivElement>(null);

  const portals = inlineComments.map((inlineComment) => {
    if (ref.current == null) {
      return <></>;
    }

    return <InlineComment inlineComment={inlineComment} />;
  });

  return (
    <div ref={ref}>
      {portals}
    </div>
  );
};
