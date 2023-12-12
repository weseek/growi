import { type ReactNode, useRef } from 'react';

import { useSWRxInlineComment } from '../../stores';

import { InlineComment } from './InlineComment';

export const InlineCommentsContainer = ({ children }: { children?: ReactNode }): JSX.Element => {

  const { data: inlineComments } = useSWRxInlineComment();

  const ref = useRef<HTMLDivElement>(null);

  const comments = (inlineComments ?? []).map((inlineComment) => {
    if (ref.current == null) {
      return <></>;
    }

    return <InlineComment inlineComment={inlineComment} />;
  });

  return (
    <div ref={ref}>
      {children}
      {comments}
    </div>
  );
};
