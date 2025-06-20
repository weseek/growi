import React, { useCallback, useState } from 'react';

import type { IUserHasId } from '@growi/core';
import { getIdStringForRef } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/toastr';
import type { IThreadRelationHasId } from '~/features/openai/interfaces/thread-relation';
import { useCurrentUser } from '~/stores-universal/context';
import loggerFactory from '~/utils/logger';

import { AiAssistantShareScope, type AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import { determineShareScope } from '../../../../utils/determine-share-scope';
import { deleteAiAssistant, setDefaultAiAssistant } from '../../../services/ai-assistant';
import { deleteThread } from '../../../services/thread';
import { useAiAssistantSidebar, useAiAssistantManagementModal } from '../../../stores/ai-assistant';
import { useSWRMUTxThreads, useSWRxThreads } from '../../../stores/thread';
import { getShareScopeIcon } from '../../../utils/get-share-scope-Icon';

import styles from './AiAssistantList.module.scss';

const logger = loggerFactory('growi:openai:client:components:AiAssistantList');

const moduleClass = styles['ai-assistant-list'] ?? '';


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
  const { t } = useTranslation();

  const deleteThreadHandler = useCallback(async() => {
    try {
      await deleteThread({ aiAssistantId: aiAssistantData._id, threadRelationId: threadData._id });
      toastSuccess(t('ai_assistant_list.toaster.thread_deleted_success'));
      onThreadDelete();
    }
    catch (err) {
      logger.error(err);
      toastError(t('ai_assistant_list.toaster.thread_deleted_failed'));
    }
  }, [aiAssistantData._id, onThreadDelete, t, threadData._id]);

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
  const { t } = useTranslation();
  const { data: threads } = useSWRxThreads(aiAssistantData._id);

  if (threads == null || threads.length === 0) {
    return <p className="text-secondary ms-5">{t('ai_assistant_list.thread_does_not_exist')}</p>;
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

  const { t } = useTranslation();
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

  const setDefaultAiAssistantHandler = useCallback(async() => {
    try {
      await setDefaultAiAssistant(aiAssistant._id, !aiAssistant.isDefault);
      onUpdated?.();
      toastSuccess(t('ai_assistant_list.toaster.ai_assistant_set_default_success'));
    }
    catch (err) {
      logger.error(err);
      toastError(t('ai_assistant_list.toaster.ai_assistant_set_default_failed'));
    }
  }, [aiAssistant._id, aiAssistant.isDefault, onUpdated, t]);

  const deleteAiAssistantHandler = useCallback(async() => {
    try {
      await deleteAiAssistant(aiAssistant._id);
      onDeleted?.();
      toastSuccess(t('ai_assistant_list.toaster.ai_assistant_deleted_success'));
    }
    catch (err) {
      logger.error(err);
      toastError(t('ai_assistant_list.toaster.ai_assistant_deleted_failed'));
    }
  }, [aiAssistant._id, onDeleted, t]);

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
        {/* <div className="d-flex justify-content-center">
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
        </div> */}

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
                setDefaultAiAssistantHandler();
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

      {/* { isThreadsOpened && (
        <ThreadItems
          aiAssistantData={aiAssistant}
          onThreadClick={onItemClick}
          onThreadDelete={mutateThreadData}
        />
      ) } */}
    </>
  );
};


/*
*  AiAssistantList
*/
type AiAssistantListProps = {
  isTeamAssistant?: boolean;
  aiAssistants: AiAssistantHasId[];
  onUpdated?: () => void;
  onDeleted?: () => void;
  onCollapsed?: () => void;
};

export const AiAssistantList: React.FC<AiAssistantListProps> = ({
  isTeamAssistant, aiAssistants, onUpdated, onDeleted, onCollapsed,
}) => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { openChat } = useAiAssistantSidebar();
  const { open: openAiAssistantManagementModal } = useAiAssistantManagementModal();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
    onCollapsed?.();
  }, [onCollapsed]);

  return (
    <div className={`${moduleClass}`}>
      <button
        type="button"
        className="btn btn-link p-0 text-secondary d-flex align-items-center"
        aria-expanded="false"
        onClick={toggleCollapse}
      >
        <h3 className="fw-bold grw-assistant-section-title mb-0 me-1">
          {t(isTeamAssistant ? 'ai_assistant_list.team_assistants' : 'ai_assistant_list.my_assistants')}
        </h3>
        <span
          className="material-symbols-outlined"
        >{isCollapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
        </span>
      </button>

      <Collapse isOpen={isCollapsed}>
        <ul className={`list-group ${moduleClass}`}>
          {aiAssistants.map(assistant => (
            <AiAssistantItem
              key={assistant._id}
              currentUser={currentUser}
              aiAssistant={assistant}
              onEditClick={openAiAssistantManagementModal}
              onItemClick={openChat}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
            />
          ))}
        </ul>
      </Collapse>
    </div>
  );
};
