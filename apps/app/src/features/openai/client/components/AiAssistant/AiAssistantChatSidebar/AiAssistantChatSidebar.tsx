import {
  type FC, memo, useRef, useEffect,
} from 'react';

import SimpleBar from 'simplebar-react';

import { useAiAssistantChatSidebar } from '../../../stores/ai-assistant';

const RIGHT_SIDEBAR_WIDTH = 500;

type AiAssistantChatSidebarSubstanceProps = {
  closeAiAssistantChatSidebar: () => void
}

const AiAssistantChatSidebarSubstance: React.FC<AiAssistantChatSidebarSubstanceProps> = (props: AiAssistantChatSidebarSubstanceProps) => {
  const { closeAiAssistantChatSidebar } = props;

  return (
    <>
      <div className="d-flex align-items-center p-3 border-bottom">
        <span className="material-symbols-outlined me-2">robot</span>
        <h6 className="mb-0 flex-grow-1">GROWI AI について</h6>
        <button
          type="button"
          className="btn btn-link p-0 border-0"
          onClick={closeAiAssistantChatSidebar}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="p-3 w-100">
        {/* AI Chat Screen Implementation */}
        {/* TODO: https://redmine.weseek.co.jp/issues/161511 */}
      </div>
    </>
  );
};


export const AiAssistantChatSidebar: FC = memo((): JSX.Element => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarScrollerRef = useRef<HTMLDivElement>(null);

  const { data: aiAssistantChatSidebarData, close: closeAiAssistantChatSidebar } = useAiAssistantChatSidebar();
  const isOpened = aiAssistantChatSidebarData?.isOpened ?? false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpened && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        closeAiAssistantChatSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeAiAssistantChatSidebar, isOpened]);

  return (
    <>
      {isOpened && (
        <div
          ref={sidebarRef}
          className="position-fixed top-0 end-0 h-100 border-start bg-white shadow-sm"
          style={{ zIndex: 1500, width: `${RIGHT_SIDEBAR_WIDTH}px` }}
          data-testid="grw-right-sidebar"
        >
          <SimpleBar
            scrollableNodeProps={{ ref: sidebarScrollerRef }}
            className="h-100 position-relative"
            autoHide
          >
            <AiAssistantChatSidebarSubstance
              closeAiAssistantChatSidebar={closeAiAssistantChatSidebar}
            />
          </SimpleBar>
        </div>
      )}
    </>
  );
});
