import { type JSX, type ReactNode, useCallback, useState } from 'react';

import { ResizableArea } from '~/client/components/Common/ResizableArea';
import {
  CHAT_SIDEBAR_WIDTH_MIN,
  getChatSidebarMaxWidth,
  useChatSidebarWidth,
} from '~/features/mastra/states';
import { useDeviceLargerThanSm } from '~/states/ui/device';

type Props = {
  children: ReactNode;
};

// Excludes the vertical scrollbar, which is where the right-anchored panel ends
const getViewportWidth = (): number | undefined =>
  typeof document === 'undefined'
    ? undefined
    : document.documentElement.clientWidth;

export const ChatSidebarResizableContainer = (props: Props): JSX.Element => {
  const { children } = props;

  const [isLargerThanSm] = useDeviceLargerThanSm();
  const [storedWidth, setStoredWidth] = useChatSidebarWidth();
  const [draggingWidth, setDraggingWidth] = useState<number | null>(null);

  const resizeHandler = useCallback((newWidth: number) => {
    setDraggingWidth(newWidth);
  }, []);

  const resizeDoneHandler = useCallback(
    (newWidth: number) => {
      setDraggingWidth(null);
      setStoredWidth(newWidth);
    },
    [setStoredWidth],
  );

  const viewportWidth = getViewportWidth();
  const maxWidth =
    viewportWidth == null ? undefined : getChatSidebarMaxWidth(viewportWidth);

  // Below sm the panel is always full width and cannot be resized
  const width = isLargerThanSm ? (draggingWidth ?? storedWidth) : undefined;
  const widthClass = isLargerThanSm ? '' : 'w-100';

  return (
    <ResizableArea
      anchor="right"
      className={`h-100 overflow-hidden ${widthClass}`}
      width={width}
      minWidth={CHAT_SIDEBAR_WIDTH_MIN}
      maxWidth={maxWidth}
      disabled={!isLargerThanSm}
      onResize={resizeHandler}
      onResizeDone={resizeDoneHandler}
    >
      {children}
    </ResizableArea>
  );
};
