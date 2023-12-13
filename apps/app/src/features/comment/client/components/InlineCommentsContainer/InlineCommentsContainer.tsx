import {
  type ReactNode, useRef, useMemo,
} from 'react';

import { useRenderedObserver } from '@growi/ui/dist/utils';

import { useSWRxInlineComment } from '../../stores';

import { InlineComment } from './InlineComment';

export const InlineCommentsContainer = ({ children }: { children?: ReactNode }): JSX.Element => {

  const { data: inlineComments } = useSWRxInlineComment();

  const containerRef = useRef<HTMLDivElement>(null);

  const { isRendering } = useRenderedObserver(containerRef);

  const inlineCommentComponents = useMemo(() => {
    if (isRendering !== false) return <></>;

    return (inlineComments ?? []).map((inlineComment) => {
      return <InlineComment key={inlineComment._id} inlineComment={inlineComment} />;
    });
  }, [inlineComments, isRendering]);

  return (
    <>
      <div ref={containerRef}>
        {children}
      </div>
      {inlineCommentComponents}
    </>
  );
};
