import React, { useCallback, useState, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';

import { AiAssistantShareScope, AiAssistantAccessScope } from '~/features/openai/interfaces/ai-assistant';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import { useCurrentUser } from '~/stores-universal/context';

import type { SelectedPage } from '../../../../interfaces/selected-page';
import { determineShareScope } from '../../../../utils/determine-share-scope';
import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

import { ShareScopeWarningModal } from './ShareScopeWarningModal';

type Props = {
  shouldEdit: boolean;
  name: string;
  description: string;
  instruction: string;
  shareScope: AiAssistantShareScope,
  accessScope: AiAssistantAccessScope,
  selectedPages: SelectedPage[];
  selectedUserGroupsForAccessScope: PopulatedGrantedGroup[],
  selectedUserGroupsForShareScope: PopulatedGrantedGroup[],
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onUpsertAiAssistant: () => Promise<void>
}

export const AiAssistantManagementHome = (props: Props): JSX.Element => {
  const {
    shouldEdit,
    name,
    description,
    instruction,
    shareScope,
    accessScope,
    selectedPages,
    selectedUserGroupsForAccessScope,
    selectedUserGroupsForShareScope,
    onNameChange,
    onDescriptionChange,
    onUpsertAiAssistant,
  } = props;

  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const { close: closeAiAssistantManagementModal, changePageMode } = useAiAssistantManagementModal();

  const [isShareScopeWarningModalOpen, setIsShareScopeWarningModalOpen] = useState(false);

  const canUpsert = name !== '' && selectedPages.length !== 0;

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

  const upsertAiAssistantHandler = useCallback(async() => {
    const shouldWarning = () => {
      const isDifferentUserGroup = () => {
        const selectedShareScopeUserGroupIds = selectedUserGroupsForShareScope.map(userGroup => userGroup.item._id);
        const selectedAccessScopeUserGroupIds = selectedUserGroupsForAccessScope.map(userGroup => userGroup.item._id);
        if (selectedShareScopeUserGroupIds.length !== selectedAccessScopeUserGroupIds.length) {
          return false;
        }
        return selectedShareScopeUserGroupIds.every((val, index) => val === selectedAccessScopeUserGroupIds[index]);
      };

      const determinedShareScope = determineShareScope(shareScope, accessScope);

      if (determinedShareScope === AiAssistantShareScope.PUBLIC_ONLY && accessScope !== AiAssistantAccessScope.PUBLIC_ONLY) {
        return true;
      }

      if (determinedShareScope === AiAssistantShareScope.OWNER && accessScope !== AiAssistantAccessScope.OWNER) {
        return true;
      }

      if (determinedShareScope === AiAssistantShareScope.GROUPS && accessScope === AiAssistantAccessScope.OWNER) {
        return true;
      }

      if (determinedShareScope === AiAssistantShareScope.GROUPS && accessScope === AiAssistantAccessScope.GROUPS && !isDifferentUserGroup()) {
        return true;
      }

      return false;
    };

    if (shouldWarning()) {
      setIsShareScopeWarningModalOpen(true);
      return;
    }

    await onUpsertAiAssistant();
  }, [accessScope, onUpsertAiAssistant, selectedUserGroupsForAccessScope, selectedUserGroupsForShareScope, shareScope]);

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
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={closeAiAssistantManagementModal}
          >
            キャンセル
          </button>

          <button
            type="button"
            disabled={!canUpsert}
            className="btn btn-primary"
            onClick={upsertAiAssistantHandler}
          >
            {t(shouldEdit ? 'アシスタントを更新する' : 'アシスタントを作成する')}
          </button>
        </ModalFooter>
      </div>

      <ShareScopeWarningModal
        isOpen={isShareScopeWarningModalOpen}
        selectedPages={selectedPages}
        closeModal={() => setIsShareScopeWarningModalOpen(false)}
        onSubmit={onUpsertAiAssistant}
      />
    </>
  );
};
