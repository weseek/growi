import type { ReactNode } from 'react';

import { useLayer, Arrow } from 'react-laag';

import { TextSelectionTools } from './TextSelectionTools';
import { useTextSelection } from './use-text-selection';

export const TextSelectableContainer = ({ children }: { children?: ReactNode }): JSX.Element => {
  // The hook we've created earlier
  const { range, ref } = useTextSelection();

  const isOpen = range != null;

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
            <TextSelectionTools range={range} />
            <Arrow {...arrowProps} />
          </div>,
        )
        : <></>
      }
    </>
  );
};
