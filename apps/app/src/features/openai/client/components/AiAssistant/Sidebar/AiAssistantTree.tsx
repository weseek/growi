import React, { useCallback, useState } from 'react';

import type { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';
import { AiAssistantShareScope, type AiAssistantHasId } from '../../../../interfaces/ai-assistant';

type ThreadItemProps = {
  name: string;
  onClick?: () => void;
};

const ThreadItem: React.FC<ThreadItemProps> = ({
  name,
  onClick,
}) => {
  return (
    <li
      className="list-group-item list-group-item-action border-0  d-flex align-items-center rounded-1 ps-5"
      onClick={onClick}
      role="button"
    >
      <div>
        <span className="material-symbols-outlined fs-5">chat</span>
      </div>
      <div className="grw-ai-assistant-title-anchor ps-1">
        <p className="text-truncate m-auto">{name}</p>
      </div>
    </li>
  );
};


const getShareScopeIcon = (shareScope: AiAssistantShareScope, accessScope: AiAssistantAccessScope): string => {
  const targetScope = shareScope === AiAssistantShareScope.SAME_AS_ACCESS_SCOPE ? accessScope : shareScope;
  switch (targetScope) {
    case AiAssistantShareScope.OWNER:
      return 'lock';
    case AiAssistantShareScope.GROUPS:
      return 'polyline';
    case AiAssistantShareScope.PUBLIC_ONLY:
      return 'group';
  }
};

type AiAssistantItemProps = {
  name: string;
  shareScope: AiAssistantShareScope;
  accessScope: AiAssistantAccessScope;
  threads: { id: string; name: string }[]; // dummy data
  onThreadClick?: (threadId: string) => void;
};

const AiAssistantItem: React.FC<AiAssistantItemProps> = ({
  name,
  shareScope,
  accessScope,
  threads,
  onThreadClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggle();
  }, [handleToggle]);

  return (
    <div className="grw-ai-assistant-item-container">
      <li
        className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1"
        onClick={handleToggle}
        role="button"
      >
        <div className="grw-triangle-container d-flex justify-content-center">
          <button
            type="button"
            className={`grw-ai-assistant-triangle-btn btn px-0 ${isExpanded ? 'grw-ai-assistant-open' : ''}`}
            onClick={handleButtonClick}
          >
            <div className="d-flex justify-content-center">
              <span className="material-symbols-outlined fs-5">arrow_right</span>
            </div>
          </button>
        </div>
        <div>
          <span className="material-symbols-outlined fs-5">{getShareScopeIcon(shareScope, accessScope)}</span>
        </div>
        <div className="grw-ai-assistant-title-anchor ps-1">
          <p className="text-truncate m-auto">{name}</p>
        </div>
      </li>

      {isExpanded && threads.length > 0 && (
        <div className="grw-ai-assistant-item-children">
          {threads.map(thread => (
            <ThreadItem
              key={thread.id}
              name={thread.name}
              onClick={() => onThreadClick?.(thread.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const dummyThreads = [
  { id: '1', name: 'thread1' },
  { id: '2', name: 'thread2' },
  { id: '3', name: 'thread3' },
];

type AiAssistantTreeProps = {
  aiAssistants: AiAssistantHasId[];
  onThreadClick?: (threadId: string) => void;
};

export const AiAssistantTree: React.FC<AiAssistantTreeProps> = ({ aiAssistants, onThreadClick }) => {
  return (
    <ul className="list-group">
      {aiAssistants.map(assistant => (
        <AiAssistantItem
          key={assistant._id}
          name={assistant.name}
          shareScope={assistant.shareScope}
          accessScope={assistant.accessScope}
          threads={dummyThreads}
          onThreadClick={onThreadClick}
        />
      ))}
    </ul>
  );
};
