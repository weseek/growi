import { useRef } from 'react';

import { useSWRxInlineComment } from '../../stores';

import { InlineComment } from './InlineComment';

export const InlineCommentsContainer = (): JSX.Element => {

  const { data: inlineComments } = useSWRxInlineComment();

  const ref = useRef<HTMLDivElement>(null);

  if (inlineComments == null) {
    return <></>;
  }

  const comments = inlineComments.map((inlineComment) => {
    if (ref.current == null) {
      return <></>;
    }

    return <InlineComment inlineComment={inlineComment} />;
  });

  return (
    <div ref={ref}>
      {comments}
    </div>
  );
};
