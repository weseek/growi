import {
  useCallback, type ReactNode, useState, useEffect,
} from 'react';

import { useLayer, Arrow } from 'react-laag';

import { TextSelectionTools } from './TextSelectionTools';
import { useTextSelection } from './use-text-selection';

export const TextSelectableContainer = ({ children }: { children?: ReactNode }): JSX.Element => {
  const [storedRange, setStoredRange] = useState<Range>();

  // The hook we've created earlier
  const { range, ref } = useTextSelection();
  useEffect(() => {
    if (range != null) {
      setStoredRange(range);
    }
  }, [range]);

  // const isOpen = range != null;
  const isOpen = storedRange != null;

  const blurFromToolsHandler = useCallback(() => {
    console.log('blur');
    // setStoredRange(undefined);
  }, []);

  const commentSubmittedHandler = useCallback(() => {
    console.log({ storedRange });
  }, [storedRange]);

  const { renderLayer, layerProps, arrowProps } = useLayer({
    isOpen,
    trigger: range != null
      ? { getBounds: () => range.getBoundingClientRect() }
      : undefined,
  });

  if (children == null) {
    return <></>;
  }

  return (
    <>
      <div ref={ref}>{children}</div>
      { isOpen
        ? renderLayer(
          <div {...layerProps}>
            <TextSelectionTools range={storedRange} onSubmit={commentSubmittedHandler} onBlur={blurFromToolsHandler} />
            {/* <TextSelectionTools range={range} onSubmit={commentSubmittedHandler} onBlur={blurFromToolsHandler} /> */}
            <Arrow {...arrowProps} />
          </div>,
        )
        : <></>
      }
    </>
  );
};
