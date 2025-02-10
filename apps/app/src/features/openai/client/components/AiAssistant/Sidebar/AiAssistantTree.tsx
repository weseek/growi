import React, { useCallback, useState } from 'react';

import { getIdStringForRef } from '@growi/core';

import { toastError, toastSuccess } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores-universal/context';

import type { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';
import { AiAssistantShareScope, type AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import { deleteAiAssistant } from '../../../services/ai-assistant';
import { useAiAssistantChatSidebar } from '../../../stores/ai-assistant';

import styles from './AiAssistantTree.module.scss';

const moduleClass = styles['ai-assistant-tree-item'] ?? '';

type Thread = {
  _id: string;
  name: string;
}

const dummyThreads: Thread[] = [
  { _id: '1', name: 'thread1' },
  { _id: '2', name: 'thread2' },
  { _id: '3', name: 'thread3' },
];

type ThreadItemProps = {
  thread: Thread;
};

const ThreadItem: React.FC<ThreadItemProps> = ({
  thread,
}) => {

  const deleteThreadHandler = useCallback(() => {
    // TODO: https://redmine.weseek.co.jp/issues/161490
  }, []);

  const openChatHandler = useCallback(() => {
    // TODO: https://redmine.weseek.co.jp/issues/159530
  }, []);

  return (
    <li
      role="button"
      className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1 ps-5"
      onClick={openChatHandler}
    >
      <div>
        <span className="material-symbols-outlined fs-5">chat</span>
      </div>

      <div className="grw-ai-assistant-title-anchor ps-1">
        <p className="text-truncate m-auto">{thread.name}</p>
      </div>

      <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
        <button
          type="button"
          className="btn btn-link text-secondary p-0"
          onClick={deleteThreadHandler}
        >
          <span className="material-symbols-outlined fs-5">delete</span>
        </button>
      </div>
    </li>
  );
};


const getShareScopeIcon = (shareScope: AiAssistantShareScope, accessScope: AiAssistantAccessScope): string => {
  const determinedSharedScope = shareScope === AiAssistantShareScope.SAME_AS_ACCESS_SCOPE ? accessScope : shareScope;
  switch (determinedSharedScope) {
    case AiAssistantShareScope.OWNER:
      return 'lock';
    case AiAssistantShareScope.GROUPS:
      return 'account_tree';
    case AiAssistantShareScope.PUBLIC_ONLY:
      return 'group';
  }
};

type AiAssistantItemProps = {
  currentUserId?: string;
  aiAssistant: AiAssistantHasId;
  threads: Thread[];
  onItemClicked?: (aiAssistantData: AiAssistantHasId) => void;
  onDeleted?: () => void;
};

const AiAssistantItem: React.FC<AiAssistantItemProps> = ({
  currentUserId,
  aiAssistant,
  threads,
  onItemClicked,
  onDeleted,
}) => {
  const [isThreadsOpened, setIsThreadsOpened] = useState(false);

  const openChatHandler = useCallback((aiAssistantData: AiAssistantHasId) => {
    onItemClicked?.(aiAssistantData);
  }, [onItemClicked]);

  const openThreadsHandler = useCallback(() => {
    setIsThreadsOpened(toggle => !toggle);
  }, []);

  const deleteAiAssistantHandler = useCallback(async() => {
    try {
      await deleteAiAssistant(aiAssistant._id);
      onDeleted?.();
      toastSuccess('アシスタントを削除しました');
    }
    catch (err) {
      toastError('アシスタントの削除に失敗しました');
    }
  }, [aiAssistant._id, onDeleted]);

  const isOperable = currentUserId != null && getIdStringForRef(aiAssistant.owner) === currentUserId;

  return (
    <>
      <li
        onClick={() => openChatHandler(aiAssistant)}
        role="button"
        className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1"
      >
        <div className="d-flex justify-content-center">
          <button
            type="button"
            onClick={openThreadsHandler}
            className={`grw-ai-assistant-triangle-btn btn px-0 ${isThreadsOpened ? 'grw-ai-assistant-open' : ''}`}
          >
            <div className="d-flex justify-content-center">
              <span className="material-symbols-outlined fs-5">arrow_right</span>
            </div>
          </button>
        </div>

        <div className="d-flex justify-content-center">
          <span className="material-symbols-outlined fs-5">{getShareScopeIcon(aiAssistant.shareScope, aiAssistant.accessScope)}</span>
        </div>

        <div className="grw-ai-assistant-title-anchor ps-1">
          <p className="text-truncate m-auto">{aiAssistant.name}</p>
        </div>

        { isOperable && (
          <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
            <button
              type="button"
              className="btn btn-link text-secondary p-0 ms-2"
            >
              <span className="material-symbols-outlined fs-5">edit</span>
            </button>
            <button
              type="button"
              className="btn btn-link text-secondary p-0"
              onClick={deleteAiAssistantHandler}
            >
              <span className="material-symbols-outlined fs-5">delete</span>
            </button>
          </div>
        )}
      </li>

      {isThreadsOpened && threads.length > 0 && (
        <div className="grw-ai-assistant-item-children">
          {threads.map(thread => (
            <ThreadItem
              key={thread._id}
              thread={thread}
            />
          ))}
        </div>
      )}
    </>
  );
};

type AiAssistantTreeProps = {
  aiAssistants: AiAssistantHasId[];
  onDeleted?: () => void;
};

export const AiAssistantTree: React.FC<AiAssistantTreeProps> = ({ aiAssistants, onDeleted }) => {
  const { data: currentUser } = useCurrentUser();
  const { open: openAiAssistantChatSidebar } = useAiAssistantChatSidebar();

  return (
    <ul className={`list-group ${moduleClass}`}>
      {aiAssistants.map(assistant => (
        <AiAssistantItem
          key={assistant._id}
          currentUserId={currentUser?._id}
          aiAssistant={assistant}
          threads={dummyThreads}
          onItemClicked={openAiAssistantChatSidebar}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
};
