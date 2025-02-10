import {
  type FC,
  memo, useCallback, useState, useRef, useEffect,
} from 'react';

import withLoadingProps from 'next-dynamic-loading-props';
import dynamic from 'next/dynamic';
import SimpleBar from 'simplebar-react';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { ResizableAreaFallback } from '~/client/components/Sidebar/ResizableArea/ResizableAreaFallback';
import type { ResizableAreaProps } from '~/client/components/Sidebar/ResizableArea/props';

// Constants
const RIGHT_SIDEBAR_MIN_WIDTH = 320;
const RIGHT_SIDEBAR_DEFAULT_WIDTH = 700;

// Import ResizableArea with loading fallback
const ResizableArea = withLoadingProps<ResizableAreaProps>(useLoadingProps => dynamic(
  () => import('~/client/components/Sidebar/ResizableArea').then(mod => mod.ResizableArea),
  {
    ssr: false,
    loading: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { children, ...rest } = useLoadingProps();
      return <ResizableAreaFallback {...rest}>{children}</ResizableAreaFallback>;
    },
  },
));

// Assistant Info Component
const AssistantInfo: FC = () => {
  return (
    <div className="p-3">
      <h6>アシスタントへの指示</h6>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>

      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>
      <p>あなたは生成 AI の専門家および、リサーチャーです。ナレッジベースの Wiki ツールである GROWI の AI 機能に関する情報...</p>


      <h6 className="mt-4">参照するページ</h6>
      <ul className="list-unstyled">
        <li><a href="#">/Project/GROWI/新機能/GROWI AI/*</a></li>
        <li><a href="#">/AI導入検討/調査</a></li>
      </ul>
    </div>
  );
};

// Resizable Container
type ResizableContainerProps = {
  children: React.ReactNode;
  onResize?: (width: number) => void;
  initialWidth?: number;
};

const ResizableContainer: FC<ResizableContainerProps> = memo(({ children, onResize, initialWidth = RIGHT_SIDEBAR_DEFAULT_WIDTH }) => {
  const [width, setWidth] = useState(initialWidth);

  const handleResize = useCallback((newWidth: number) => {
    setWidth(newWidth);
    onResize?.(newWidth);
  }, [onResize]);

  return (
    <div className="d-flex h-100">
      <ResizableArea
        className="flex-grow-1 transition-width"
        width={width}
        minWidth={RIGHT_SIDEBAR_MIN_WIDTH}
        onResize={handleResize}
      >
        {children}
      </ResizableArea>
    </div>
  );
});

// Right Sidebar Tab
type RightSidebarTabProps = {
  isOpen: boolean;
  onClick: () => void;
};

const RightSidebarTab: FC<RightSidebarTabProps> = memo(({ isOpen, onClick }) => {
  return (
    <button
      type="button"
      className="position-fixed top-50 end-0 bg-white border-start border-top border-bottom px-2 py-3 translate-middle-y"
      style={{
        transform: 'translateX(-100%) translateY(-50%) rotate(-90deg)',
        transformOrigin: '100% 50%',
        borderRadius: '4px 4px 0 0',
        zIndex: 1030,
      }}
      onClick={onClick}
    >
      <span className="d-flex align-items-center">
        <span className="material-symbols-outlined me-2" style={{ transform: 'rotate(90deg)' }}>
          {isOpen ? 'close' : 'robot'}
        </span>
        GROWI AI について
      </span>
    </button>
  );
});

// Right Sidebar Head
type RightSidebarHeadProps = {
  onClose: () => void;
};

const RightSidebarHead: FC<RightSidebarHeadProps> = memo(({ onClose }) => {
  return (
    <div className="d-flex align-items-center p-3 border-bottom">
      <span className="material-symbols-outlined me-2">robot</span>
      <h6 className="mb-0 flex-grow-1">GROWI AI について</h6>
      <button
        type="button"
        className="btn btn-link p-0 border-0"
        onClick={onClose}
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
});

// Main Right Sidebar Component
export const RightSidebar: FC = memo((): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setClient] = useState(false);
  const [width, setWidth] = useState(RIGHT_SIDEBAR_DEFAULT_WIDTH);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarScrollerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    setClient(true);
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle clicks outside of sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isClient) {
    return <></>;
  }

  return (
    <>
      <RightSidebarTab
        isOpen={isOpen}
        onClick={handleToggle}
      />
      {isOpen && (
        <div
          ref={sidebarRef}
          className="position-fixed top-0 end-0 h-100 border-start bg-white shadow-sm"
          style={{ zIndex: 1500 }}
          data-testid="grw-right-sidebar"
        >
          <ResizableContainer onResize={setWidth}>
            <div className="h-100 d-flex flex-column">
              <RightSidebarHead onClose={handleToggle} />
              <div className="flex-grow-1" style={{ height: 'calc(100% - 56px)' }}>
                <SimpleBar
                  scrollableNodeProps={{ ref: sidebarScrollerRef }}
                  style={{ height: '100%' }}
                  className="h-100 position-relative"
                  autoHide
                >
                  <AssistantInfo />
                </SimpleBar>
              </div>
            </div>
          </ResizableContainer>
        </div>
      )}
    </>
  );
});

// Usage example:
// Usage example:
// <RightSidebar />
