import React, { useCallback, useState } from 'react';

import type { IGrantedGroup } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { Modal, TabContent, TabPane } from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/toastr';
import { AiAssistantAccessScope, AiAssistantShareScope, AiAssistantScopeType } from '~/features/openai/interfaces/ai-assistant';
import type { IPageForItem } from '~/interfaces/page';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import loggerFactory from '~/utils/logger';

import type { SelectedPage } from '../../../../interfaces/selected-page';
import { createAiAssistant } from '../../../services/ai-assistant';
import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';

import { AiAssistantManagementEditInstruction } from './AiAssistantManagementEditInstruction';
import { AiAssistantManagementEditPages } from './AiAssistantManagementEditPages';
import { AiAssistantManagementEditShare } from './AiAssistantManagementEditShare';
import { AiAssistantManagementHome } from './AiAssistantManagementHome';

import styles from './AiAssistantManagementModal.module.scss';

const moduleClass = styles['grw-ai-assistant-management'] ?? '';

const logger = loggerFactory('growi:openai:client:components:AiAssistantManagementModal');

// PopulatedGrantedGroup[] -> IGrantedGroup[]
const convertToGrantedGroups = (selectedGroups: PopulatedGrantedGroup[]): IGrantedGroup[] => {
  return selectedGroups.map(group => ({
    type: group.type,
    item: group.item._id,
  }));
};

const AiAssistantManagementModalSubstance = (): JSX.Element => {
  // Hooks
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData, close: closeAiAssistantManagementModal } = useAiAssistantManagementModal();

  const pageMode = aiAssistantManagementModalData?.pageMode ?? AiAssistantManagementModalPageMode.HOME;

  // States
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedShareScope, setSelectedShareScope] = useState<AiAssistantShareScope>(AiAssistantShareScope.SAME_AS_ACCESS_SCOPE);
  const [selectedAccessScope, setSelectedAccessScope] = useState<AiAssistantAccessScope>(AiAssistantAccessScope.OWNER);
  const [selectedUserGroupsForAccessScope, setSelectedUserGroupsForAccessScope] = useState<PopulatedGrantedGroup[]>([]);
  const [selectedUserGroupsForShareScope, setSelectedUserGroupsForShareScope] = useState<PopulatedGrantedGroup[]>([]);
  const [selectedPages, setSelectedPages] = useState<SelectedPage[]>([]);
  const [instruction, setInstruction] = useState<string>(t('modal_ai_assistant.default_instruction'));


  /*
  *  For AiAssistantManagementHome methods
  */
  const changeNameHandler = useCallback((value: string) => {
    setName(value);
  }, []);

  const changeDescriptionHandler = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const createAiAssistantHandler = useCallback(async() => {
    try {
      const pagePathPatterns = selectedPages
        .map(selectedPage => (selectedPage.isIncludeSubPage ? `${selectedPage.page.path}/*` : selectedPage.page.path))
        .filter((path): path is string => path !== undefined && path !== null);

      const grantedGroupsForShareScope = convertToGrantedGroups(selectedUserGroupsForShareScope);
      const grantedGroupsForAccessScope = convertToGrantedGroups(selectedUserGroupsForAccessScope);

      await createAiAssistant({
        name,
        description,
        additionalInstruction: instruction,
        pagePathPatterns,
        shareScope: selectedShareScope,
        accessScope: selectedAccessScope,
        grantedGroupsForShareScope: selectedShareScope === AiAssistantShareScope.GROUPS ? grantedGroupsForShareScope : undefined,
        grantedGroupsForAccessScope: selectedAccessScope === AiAssistantAccessScope.GROUPS ? grantedGroupsForAccessScope : undefined,
      });

      toastSuccess('アシスタントを作成しました');
      closeAiAssistantManagementModal();
    }
    catch (err) {
      toastError('アシスタントの作成に失敗しました');
      logger.error(err);
    }
  }, [
    closeAiAssistantManagementModal,
    description,
    instruction,
    name,
    selectedAccessScope,
    selectedPages,
    selectedShareScope,
    selectedUserGroupsForAccessScope,
    selectedUserGroupsForShareScope,
  ]);


  /*
  *  For AiAssistantManagementEditShare methods
  */
  const selectScopeHandler = useCallback((targetScope: AiAssistantAccessScope | AiAssistantShareScope, scopeType: AiAssistantScopeType) => {
    if (scopeType === AiAssistantScopeType.ACCESS) {
      setSelectedAccessScope(targetScope as AiAssistantAccessScope);
      return;
    }
    if (scopeType === AiAssistantScopeType.SHARE) {
      setSelectedShareScope(targetScope as AiAssistantShareScope);
      return;
    }
  }, []);

  const selectUserGroupsHandler = useCallback((targetUserGroup: PopulatedGrantedGroup, scopeType: AiAssistantScopeType) => {
    const selectedUserGroups = scopeType === AiAssistantScopeType.ACCESS ? selectedUserGroupsForAccessScope : selectedUserGroupsForShareScope;
    const setSelectedUserGroups = scopeType === AiAssistantScopeType.ACCESS ? setSelectedUserGroupsForAccessScope : setSelectedUserGroupsForShareScope;

    const selectedUserGroupIds = selectedUserGroups.map(userGroup => userGroup.item._id);
    if (selectedUserGroupIds.includes(targetUserGroup.item._id)) {
      // if selected, remove it
      setSelectedUserGroups(selectedUserGroups.filter(userGroup => userGroup.item._id !== targetUserGroup.item._id));
    }
    else {
      // if not selected, add it
      setSelectedUserGroups([...selectedUserGroups, targetUserGroup]);
    }
  }, [selectedUserGroupsForAccessScope, selectedUserGroupsForShareScope]);


  /*
  *  For AiAssistantManagementEditPages methods
  */
  const selectPageHandler = useCallback((page: IPageForItem, isIncludeSubPage: boolean) => {
    const selectedPageIds = selectedPages.map(selectedPage => selectedPage.page._id);
    if (page._id != null && !selectedPageIds.includes(page._id)) {
      setSelectedPages([...selectedPages, { page, isIncludeSubPage }]);
    }
  }, [selectedPages]);

  const removePageHandler = useCallback((pageId: string) => {
    setSelectedPages(selectedPages.filter(selectedPage => selectedPage.page._id !== pageId));
  }, [selectedPages]);


  /*
  *  For AiAssistantManagementEditInstruction methods
  */
  const changeInstructionHandler = useCallback((value: string) => {
    setInstruction(value);
  }, []);

  const resetInstructionHandler = useCallback(() => {
    setInstruction(t('modal_ai_assistant.default_instruction'));
  }, [t]);

  return (
    <>
      <TabContent activeTab={pageMode}>
        <TabPane tabId={AiAssistantManagementModalPageMode.HOME}>
          <AiAssistantManagementHome
            name={name}
            description={description}
            shareScope={selectedShareScope}
            instruction={instruction}
            onNameChange={changeNameHandler}
            onDescriptionChange={changeDescriptionHandler}
            onCreateAiAssistant={createAiAssistantHandler}
          />
        </TabPane>

        <TabPane tabId={AiAssistantManagementModalPageMode.SHARE}>
          <AiAssistantManagementEditShare
            selectedShareScope={selectedShareScope}
            selectedAccessScope={selectedAccessScope}
            selectedUserGroupsForShareScope={selectedUserGroupsForShareScope}
            selectedUserGroupsForAccessScope={selectedUserGroupsForAccessScope}
            onSelectScope={selectScopeHandler}
            onSelectUserGroup={selectUserGroupsHandler}
            // onSelectShareScope={selectShareScopeHandler}
            // onSelectAccessScope={selectAccessScopeHandler}
          />
        </TabPane>

        <TabPane tabId={AiAssistantManagementModalPageMode.PAGES}>
          <AiAssistantManagementEditPages
            selectedPages={selectedPages}
            onSelect={selectPageHandler}
            onRemove={removePageHandler}
          />
        </TabPane>

        <TabPane tabId={AiAssistantManagementModalPageMode.INSTRUCTION}>
          <AiAssistantManagementEditInstruction
            instruction={instruction}
            onChange={changeInstructionHandler}
            onReset={resetInstructionHandler}
          />
        </TabPane>
      </TabContent>
    </>
  );
};


export const AiAssistantManagementModal = (): JSX.Element => {
  const { data: aiAssistantManagementModalData, close: closeAiAssistantManagementModal } = useAiAssistantManagementModal();

  const isOpened = aiAssistantManagementModalData?.isOpened ?? false;

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeAiAssistantManagementModal} className={moduleClass} scrollable>
      { isOpened && (
        <AiAssistantManagementModalSubstance />
      ) }
    </Modal>
  );
};
