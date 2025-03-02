import React, { useCallback, useState } from 'react';

import type { IUserHasId } from '@growi/core';
import { getIdStringForRef } from '@growi/core';

import { toastError, toastSuccess } from '~/client/util/toastr';
import type { IThreadRelationHasId } from '~/features/openai/interfaces/thread-relation';
import { useCurrentUser } from '~/stores-universal/context';
import loggerFactory from '~/utils/logger';

import type { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';
import { AiAssistantShareScope, type AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import { determineShareScope } from '../../../../utils/determine-share-scope';
import { deleteAiAssistant, toggleDefaultAiAssistant } from '../../../services/ai-assistant';
import { deleteThread } from '../../../services/thread';
import { useAiAssistantChatSidebar, useAiAssistantManagementModal } from '../../../stores/ai-assistant';
import { useSWRMUTxThreads, useSWRxThreads } from '../../../stores/thread';

import styles from './AiAssistantTree.module.scss';

const logger = loggerFactory('growi:openai:client:components:AiAssistantTree');

const moduleClass = styles['ai-assistant-tree-item'] ?? '';


/*
*  ThreadItem
*/
type ThreadItemProps = {
  threadData: IThreadRelationHasId
  aiAssistantData: AiAssistantHasId;
  onThreadClick: (aiAssistantData: AiAssistantHasId, threadData?: IThreadRelationHasId) => void;
  onThreadDelete: () => void;
};

const ThreadItem: React.FC<ThreadItemProps> = ({
  threadData, aiAssistantData, onThreadClick, onThreadDelete,
}) => {

  const deleteThreadHandler = useCallback(async() => {
    try {
      await deleteThread({ aiAssistantId: aiAssistantData._id, threadRelationId: threadData._id });
      toastSuccess('スレッドを削除しました');
      onThreadDelete();
    }
    catch (err) {
      logger.error(err);
      toastError('スレッドの削除に失敗しました');
    }
  }, [aiAssistantData._id, onThreadDelete, threadData._id]);

  const openChatHandler = useCallback(() => {
    onThreadClick(aiAssistantData, threadData);
  }, [aiAssistantData, onThreadClick, threadData]);

  return (
    <li
      role="button"
      className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1 ps-5"
      onClick={(e) => {
        e.stopPropagation();
        openChatHandler();
      }}
    >
      <div>
        <span className="material-symbols-outlined fs-5">chat</span>
      </div>

      <div className="grw-ai-assistant-title-anchor ps-1">
        <p className="text-truncate m-auto">{threadData?.title ?? 'Untitled thread'}</p>
      </div>

      <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
        <button
          type="button"
          className="btn btn-link text-secondary p-0"
          onClick={(e) => {
            e.stopPropagation();
            deleteThreadHandler();
          }}
        >
          <span className="material-symbols-outlined fs-5">delete</span>
        </button>
      </div>
    </li>
  );
};


/*
*  ThreadItems
*/
type ThreadItemsProps = {
  aiAssistantData: AiAssistantHasId;
  onThreadClick: (aiAssistantData: AiAssistantHasId, threadData?: IThreadRelationHasId) => void;
  onThreadDelete: () => void;
};

const ThreadItems: React.FC<ThreadItemsProps> = ({ aiAssistantData, onThreadClick, onThreadDelete }) => {
  const { data: threads } = useSWRxThreads(aiAssistantData._id);

  if (threads == null || threads.length === 0) {
    return <p className="text-secondary ms-5">スレッドが存在しません</p>;
  }

  return (
    <div className="grw-ai-assistant-item-children">
      {threads.map(thread => (
        <ThreadItem
          key={thread._id}
          threadData={thread}
          aiAssistantData={aiAssistantData}
          onThreadClick={onThreadClick}
          onThreadDelete={onThreadDelete}
        />
      ))}
    </div>
  );
};


/*
*  AiAssistantItem
*/
const getShareScopeIcon = (shareScope: AiAssistantShareScope, accessScope: AiAssistantAccessScope): string => {
  const determinedSharedScope = determineShareScope(shareScope, accessScope);
  switch (determinedSharedScope) {
    case AiAssistantShareScope.OWNER:
      return 'lock';
    case AiAssistantShareScope.GROUPS:
      return 'account_tree';
    case AiAssistantShareScope.PUBLIC_ONLY:
      return 'group';
    case AiAssistantShareScope.SAME_AS_ACCESS_SCOPE:
      return '';
  }
};

type AiAssistantItemProps = {
  currentUser?: IUserHasId | null;
  aiAssistant: AiAssistantHasId;
  onEditClick: (aiAssistantData: AiAssistantHasId) => void;
  onItemClick: (aiAssistantData: AiAssistantHasId, threadData?: IThreadRelationHasId) => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
};

const AiAssistantItem: React.FC<AiAssistantItemProps> = ({
  currentUser,
  aiAssistant,
  onEditClick,
  onItemClick,
  onUpdated,
  onDeleted,
}) => {
  const [isThreadsOpened, setIsThreadsOpened] = useState(false);

  const { trigger: mutateThreadData } = useSWRMUTxThreads(aiAssistant._id);

  const openManagementModalHandler = useCallback((aiAssistantData: AiAssistantHasId) => {
    onEditClick(aiAssistantData);
  }, [onEditClick]);

  const openChatHandler = useCallback((aiAssistantData: AiAssistantHasId) => {
    onItemClick(aiAssistantData);
  }, [onItemClick]);

  const openThreadsHandler = useCallback(async() => {
    mutateThreadData();
    setIsThreadsOpened(toggle => !toggle);
  }, [mutateThreadData]);

  const toggleDefaultAiAssistantHandler = useCallback(async() => {
    try {
      await toggleDefaultAiAssistant(aiAssistant._id, !aiAssistant.isDefault);
      onUpdated?.();
      toastSuccess('デフォルトアシスタントを切り替えました');
    }
    catch (err) {
      logger.error(err);
      toastError('デフォルトアシスタントの切り替えに失敗しました');
    }
  }, [aiAssistant._id, aiAssistant.isDefault, onUpdated]);

  const deleteAiAssistantHandler = useCallback(async() => {
    try {
      await deleteAiAssistant(aiAssistant._id);
      onDeleted?.();
      toastSuccess('アシスタントを削除しました');
    }
    catch (err) {
      logger.error(err);
      toastError('アシスタントの削除に失敗しました');
    }
  }, [aiAssistant._id, onDeleted]);

  const isOperable = currentUser?._id != null && getIdStringForRef(aiAssistant.owner) === currentUser._id;
  const isPublicAiAssistantOperable = currentUser?.admin
    && determineShareScope(aiAssistant.shareScope, aiAssistant.accessScope) === AiAssistantShareScope.PUBLIC_ONLY;

  return (
    <>
      <li
        onClick={(e) => {
          e.stopPropagation();
          openChatHandler(aiAssistant);
        }}
        role="button"
        className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1"
      >
        <div className="d-flex justify-content-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openThreadsHandler();
            }}
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

        <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
          {isPublicAiAssistantOperable && (
            <button
              type="button"
              className="btn btn-link text-secondary p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleDefaultAiAssistantHandler();
              }}
            >
              <span className={`material-symbols-outlined fs-5 ${aiAssistant.isDefault ? 'fill' : ''}`}>star</span>
            </button>
          )}
          {isOperable && (
            <>
              <button
                type="button"
                className="btn btn-link text-secondary p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  openManagementModalHandler(aiAssistant);
                }}
              >
                <span className="material-symbols-outlined fs-5">edit</span>
              </button>
              <button
                type="button"
                className="btn btn-link text-secondary p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAiAssistantHandler();
                }}
              >
                <span className="material-symbols-outlined fs-5">delete</span>
              </button>
            </>
          )}
        </div>
      </li>

      { isThreadsOpened && (
        <ThreadItems
          aiAssistantData={aiAssistant}
          onThreadClick={onItemClick}
          onThreadDelete={mutateThreadData}
        />
      ) }
    </>
  );
};


/*
*  AiAssistantTree
*/
type AiAssistantTreeProps = {
  aiAssistants: AiAssistantHasId[];
  onUpdated?: () => void;
  onDeleted?: () => void;
};

export const AiAssistantTree: React.FC<AiAssistantTreeProps> = ({ aiAssistants, onUpdated, onDeleted }) => {
  const { data: currentUser } = useCurrentUser();
  const { open: openAiAssistantChatSidebar } = useAiAssistantChatSidebar();
  const { open: openAiAssistantManagementModal } = useAiAssistantManagementModal();

  return (
    <ul className={`list-group ${moduleClass}`}>
      {aiAssistants.map(assistant => (
        <AiAssistantItem
          key={assistant._id}
          currentUser={currentUser}
          aiAssistant={assistant}
          onEditClick={openAiAssistantManagementModal}
          onItemClick={openAiAssistantChatSidebar}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
};
