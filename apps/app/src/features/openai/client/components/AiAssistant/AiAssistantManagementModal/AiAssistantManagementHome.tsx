import React, { useCallback, useState, useMemo } from 'react';

import { PageGrant } from '@growi/core';
import { useTranslation } from 'react-i18next';
import {
  ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';

import { AiAssistantShareScope } from '~/features/openai/interfaces/ai-assistant';
import { useCurrentUser } from '~/stores-universal/context';

import type { SelectedPage } from '../../../../interfaces/selected-page';
import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

import { ShareScopeWarningModal } from './ShareScopeWarningModal';

type Props = {
  shouldEdit: boolean;
  name: string;
  description: string;
  instruction: string;
  shareScope: AiAssistantShareScope,
  selectedPages: SelectedPage[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCreateAiAssistant: () => Promise<void>
}

export const AiAssistantManagementHome = (props: Props): JSX.Element => {
  const {
    shouldEdit,
    name,
    description,
    instruction,
    shareScope,
    selectedPages,
    onNameChange,
    onDescriptionChange,
    onCreateAiAssistant,
  } = props;

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { close: closeAiAssistantManagementModal, changePageMode } = useAiAssistantManagementModal();

  const [isShareScopeWarningModalOpen, setIsShareScopeWarningModalOpen] = useState(false);

  const canUpsert = name !== '' && selectedPages.length !== 0;

  const grantedPages = useMemo(() => {
    return selectedPages.filter(selectedPage => selectedPage.page.grant !== PageGrant.GRANT_PUBLIC);
  }, [selectedPages]);

  const totalSelectedPageCount = useMemo(() => {
    return selectedPages.reduce((total, selectedPage) => {
      const descendantCount = selectedPage.isIncludeSubPage
        ? selectedPage.page.descendantCount ?? 0
        : 0;
      const pageCountWithDescendants = descendantCount + 1;
      return total + pageCountWithDescendants;
    }, 0);
  }, [selectedPages]);

  const getShareScopeLabel = useCallback((shareScope: AiAssistantShareScope) => {
    const baseLabel = `modal_ai_assistant.share_scope.${shareScope}.label`;
    return shareScope === AiAssistantShareScope.OWNER
      ? t(baseLabel, { username: currentUser?.username })
      : t(baseLabel);
  }, [currentUser?.username, t]);

  const createAiAssistantHandler = useCallback(async() => {
    if (grantedPages.length !== 0) {
      setIsShareScopeWarningModalOpen(true);
      return;
    }

    await onCreateAiAssistant();
  }, [grantedPages.length, onCreateAiAssistant]);

  return (
    <>
      <ModalHeader tag="h4" toggle={closeAiAssistantManagementModal} className="pe-4">
        <span className="growi-custom-icons growi-ai-assistant-icon me-3 fs-4">ai_assistant</span>
        <span className="fw-bold">{t(shouldEdit ? 'アシスタントの更新' : '新規アシスタントの追加')}</span> {/* TODO i18n */}
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
                <span>{`${totalSelectedPageCount} ページ`}</span>
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
          <button
            type="button"
            disabled={!canUpsert}
            className="btn btn-primary"
            onClick={createAiAssistantHandler}
          >
            {t(shouldEdit ? 'アシスタントを更新する' : 'アシスタントを作成する')}
          </button>
        </ModalFooter>
      </div>

      <ShareScopeWarningModal
        isOpen={isShareScopeWarningModalOpen}
        grantedPages={grantedPages}
        closeModal={() => setIsShareScopeWarningModalOpen(false)}
        onSubmit={onCreateAiAssistant}
      />
    </>
  );
};
