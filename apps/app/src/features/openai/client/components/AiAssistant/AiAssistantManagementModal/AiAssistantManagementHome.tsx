import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';

import { AiAssistantShareScope } from '~/features/openai/interfaces/ai-assistant';
import { useCurrentUser } from '~/stores-universal/context';

import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

import { ShareScopeWarningModal } from './ShareScopeWarningModal';

type Props = {
  name: string;
  description: string;
  instruction: string;
  shareScope: AiAssistantShareScope
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreateAiAssistant: () => Promise<void>
}

export const AiAssistantManagementHome = (props: Props): JSX.Element => {
  const {
    name,
    description,
    instruction,
    shareScope,
    onNameChange,
    onDescriptionChange,
    onCreateAiAssistant,
  } = props;

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { close: closeAiAssistantManagementModal, changePageMode } = useAiAssistantManagementModal();

  const [isShareScopeWarningModalOpen, setIsShareScopeWarningModalOpen] = useState(false);

  const getShareScopeLabel = useCallback((shareScope: AiAssistantShareScope) => {
    const baseLabel = `modal_ai_assistant.share_scope.${shareScope}.label`;
    return shareScope === AiAssistantShareScope.OWNER
      ? t(baseLabel, { username: currentUser?.username })
      : t(baseLabel);
  }, [currentUser?.username, t]);

  const createAiAssistantHandler = useCallback(() => {
    // TODO: Implement the logic to check if the assistant has a share scope that includes private pages
    // task: https://redmine.weseek.co.jp/issues/161341
    if (true) {
      setIsShareScopeWarningModalOpen(true);
      return;
    }

    onCreateAiAssistant();
  }, [onCreateAiAssistant]);

  return (
    <>
      <ModalHeader tag="h4" toggle={closeAiAssistantManagementModal} className="pe-4">
        <span className="growi-custom-icons growi-ai-assistant-icon me-3 fs-4">ai_assistant</span>
        <span className="fw-bold">新規アシスタントの追加</span> {/* TODO i18n */}
      </ModalHeader>

      <div className="px-4">
        <ModalBody>
          <div className="mb-4 growi-ai-assistant-name">
            <Input
              type="text"
              placeholder="アシスタント名を入力"
              bsSize="lg"
              className="border-0 border-bottom border-2 px-0 rounded-0"
              value={name}
              onChange={e => onNameChange(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <span className="text-secondary">アシスタントのメモ</span>
              <span className="badge text-bg-secondary ms-2">任意</span>
            </div>
            <Input
              type="textarea"
              placeholder="内容や用途のメモを表示させることができます"
              rows="4"
              value={description}
              onChange={e => onDescriptionChange(e.target.value)}
            />
            <small className="text-secondary d-block mt-2">
              メモの内容はアシスタントの処理に影響しません。
            </small>
          </div>

          <div>
            <button
              type="button"
              onClick={() => { changePageMode(AiAssistantManagementModalPageMode.SHARE) }}
              className="btn w-100 d-flex justify-content-between align-items-center py-3 mb-2 border-0"
            >
              <span className="fw-normal">{t('modal_ai_assistant.page_mode_title.share')}</span>
              <div className="d-flex align-items-center text-secondary">
                <span>{getShareScopeLabel(shareScope)}</span>
                <span className="material-symbols-outlined ms-2 align-middle">chevron_right</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { changePageMode(AiAssistantManagementModalPageMode.PAGES) }}
              className="btn w-100 d-flex justify-content-between align-items-center py-3 mb-2 border-0"
            >
              <span className="fw-normal">{t('modal_ai_assistant.page_mode_title.pages')}</span>
              <div className="d-flex align-items-center text-secondary">
                <span>3ページ</span>
                <span className="material-symbols-outlined ms-2 align-middle">chevron_right</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { changePageMode(AiAssistantManagementModalPageMode.INSTRUCTION) }}
              className="btn w-100 d-flex justify-content-between align-items-center py-3 mb-2 border-0"
            >
              <span className="fw-normal">{t('modal_ai_assistant.page_mode_title.instruction')}</span>
              <div className="d-flex align-items-center text-secondary">
                <span className="text-truncate" style={{ maxWidth: '280px' }}>
                  {instruction}
                </span>
                <span className="material-symbols-outlined ms-2 align-middle">chevron_right</span>
              </div>
            </button>
          </div>
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-outline-secondary" onClick={closeAiAssistantManagementModal}>キャンセル</button>
          <button type="button" className="btn btn-primary" onClick={createAiAssistantHandler}>アシスタントを作成する</button>
        </ModalFooter>
      </div>

      <ShareScopeWarningModal
        isOpen={isShareScopeWarningModalOpen}
        closeModal={() => setIsShareScopeWarningModalOpen(false)}
        onCreateAiAssistant={onCreateAiAssistant}
      />
    </>
  );
};
