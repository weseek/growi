import {
  useCallback,
  type FocusEvent,
} from 'react';

import dynamic from 'next/dynamic';

const InlineCommentForm = dynamic(() => import('~/features/comment/client').then(mod => mod.InlineCommentForm), { ssr: false });

type Props = {
  range: Range,
  onExit?: () => void,
}

export const TextSelectionTools = (props: Props): JSX.Element | null => {
  const { range, onExit } = props;

  const blurHandler = useCallback((e: FocusEvent<HTMLDivElement>) => {
    // fire onExit only when the blue event has invoked from children
    if (!e.currentTarget?.contains(e.relatedTarget)) {
      onExit?.();
    }
  }, [onExit]);

  return (
    <div className="card" onBlur={blurHandler}>
      <div className="card-body py-1 px-3">
        <InlineCommentForm range={range} onExit={onExit} />
      </div>
    </div>
  );
};
