import {
  useCallback, type ReactNode, useState, useEffect,
} from 'react';

import { useLayer } from 'react-laag';

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

  const isOpen = storedRange != null;

  const toolsExitHandler = useCallback(() => {
    setStoredRange(undefined);
  }, []);

  const { renderLayer, layerProps } = useLayer({
    isOpen,
    trigger: isOpen
      ? { getBounds: () => storedRange.getBoundingClientRect() }
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
          <div className="z-1" {...layerProps}>
            <TextSelectionTools range={storedRange} onExit={toolsExitHandler} />
          </div>,
        )
        : <></>
      }
    </>
  );
};
