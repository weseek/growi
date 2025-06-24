import React, { useCallback } from 'react';

import type { IThreadRelationHasId } from '~/features/openai/interfaces/thread-relation';

import { useAiAssistantSidebar } from '../../../stores/ai-assistant';
import { useSWRxThreads } from '../../../stores/thread';


export const ThreadList: React.FC = () => {
  const { openChat, data: aiAssistantSidebarData } = useAiAssistantSidebar();
  const { data: threads } = useSWRxThreads(aiAssistantSidebarData?.aiAssistantData?._id);

  const openChatHandler = useCallback((threadData: IThreadRelationHasId) => {
    const aiAssistantData = aiAssistantSidebarData?.aiAssistantData;
    if (aiAssistantData == null) {
      return;
    }

    openChat(aiAssistantData, threadData);
  }, [aiAssistantSidebarData?.aiAssistantData, openChat]);

  return (
    <>
      <ul className="list-group">
        {threads?.map(thread => (
          <li
            onClick={() => { openChatHandler(thread) }}
            key={thread._id}
            role="button"
            className="d-flex align-items-center list-group-item list-group-item-action border-0 rounded-1 bg-body-tertiary mb-2"
          >
            <div className="text-body-secondary">
              <span className="material-symbols-outlined fs-5 me-2">chat</span>
              <span className="flex-grow-1">{thread.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};
