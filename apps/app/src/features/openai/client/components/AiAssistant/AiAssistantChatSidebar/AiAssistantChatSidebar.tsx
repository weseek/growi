import {
  type FC,
  memo, useCallback, useState, useRef, useEffect,
} from 'react';

import SimpleBar from 'simplebar-react';

const RIGHT_SIDEBAR_WIDTH = 500;

// Assistant Info Component
const AssistantInfo: FC = () => {
  return (
    <div className="p-3 w-100">
      {/* AI Chat Screen Implementation */}
      {/* TODO: https://redmine.weseek.co.jp/issues/161511 */}
    </div>
  );
};

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


export const AiAssistantChatSidebar: FC = memo((): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarScrollerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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
          style={{ zIndex: 1500, width: `${RIGHT_SIDEBAR_WIDTH}px` }}
          data-testid="grw-right-sidebar"
        >
          <div className="d-flex align-items-center p-3 border-bottom">
            <span className="material-symbols-outlined me-2">robot</span>
            <h6 className="mb-0 flex-grow-1">GROWI AI について</h6>
            <button
              type="button"
              className="btn btn-link p-0 border-0"
              onClick={handleToggle}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>


          <SimpleBar
            scrollableNodeProps={{ ref: sidebarScrollerRef }}
            className="h-100 position-relative"
            autoHide
          >
            <AssistantInfo />
          </SimpleBar>
        </div>
      )}
    </>
  );
});
