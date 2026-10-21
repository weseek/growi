import {
  type JSX,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getViewportWidth,
  ResizableArea,
} from '~/client/components/Common/ResizableArea';
import {
  CHAT_SIDEBAR_WIDTH_MIN,
  getChatSidebarMaxWidth,
  useChatSidebarWidth,
} from '~/features/mastra/states';
import { useDeviceLargerThanSm } from '~/states/ui/device';

import styles from './ChatSidebarResizableContainer.module.scss';

const areaClass = styles['grw-chat-sidebar-resizable-area'] ?? '';

type Props = {
  children: ReactNode;
};

// Tracks the viewport width so the upper bound follows window resizes
const useViewportWidth = (): number => {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);

  useEffect(() => {
    const handler = () => setViewportWidth(getViewportWidth());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return viewportWidth;
};

export const ChatSidebarResizableContainer = (props: Props): JSX.Element => {
  const { children } = props;

  const [isLargerThanSm] = useDeviceLargerThanSm();
  const [storedWidth, setStoredWidth] = useChatSidebarWidth();
  const [draggingWidth, setDraggingWidth] = useState<number | null>(null);
  const viewportWidth = useViewportWidth();

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

  const maxWidth = getChatSidebarMaxWidth(viewportWidth);

  // The stored width may exceed what the current viewport allows (saved on a
  // wider screen), so the upper bound is applied on every render, not only
  // while dragging. The stored value itself is left untouched.
  const requestedWidth = draggingWidth ?? storedWidth;
  const width = Math.min(requestedWidth, maxWidth);

  // Below sm the panel is full width (see the module stylesheet) and cannot be resized
  return (
    <ResizableArea
      anchor="right"
      className={`h-100 overflow-hidden ${areaClass}`}
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
