import React, {
  useCallback, useState, useEffect,
} from 'react';

import {
  type IGrantedGroup, type IPageHasId, isPopulated,
} from '@growi/core';
import { useTranslation } from 'react-i18next';
import { Modal, TabContent, TabPane } from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/toastr';
import { AiAssistantAccessScope, AiAssistantShareScope } from '~/features/openai/interfaces/ai-assistant';
import type { IPageForItem } from '~/interfaces/page';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';
import { useSWRxPagesByPaths } from '~/stores/page-listing';
import loggerFactory from '~/utils/logger';

import type { SelectedPage } from '../../../../interfaces/selected-page';
import { createAiAssistant, updateAiAssistant } from '../../../services/ai-assistant';
import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode, useSWRxAiAssistants } from '../../../stores/ai-assistant';

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

// IGrantedGroup[] -> PopulatedGrantedGroup[]
const convertToPopulatedGrantedGroups = (selectedGroups: IGrantedGroup[]): PopulatedGrantedGroup[] => {
  const populatedGrantedGroups = selectedGroups.filter(group => isPopulated(group.item)) as PopulatedGrantedGroup[];
  return populatedGrantedGroups;
};

const convertToSelectedPages = (pagePathPatterns: string[], fetchedPageData: IPageHasId[]): SelectedPage[] => {
  return pagePathPatterns.map((pagePathPattern) => {
    const isIncludeSubPage = pagePathPattern.endsWith('/*');
    const path = isIncludeSubPage ? pagePathPattern.slice(0, -2) : pagePathPattern;
    const page = fetchedPageData.find(page => page.path === path);
    return {
      page: page ?? { path },
      isIncludeSubPage,
    };
  });
};

const removeGlobPath = (pagePathPattens?: string[]): string[] => {
  if (pagePathPattens == null) {
    return [];
  }
  return pagePathPattens.map((pagePathPattern) => {
    return pagePathPattern.endsWith('/*') ? pagePathPattern.slice(0, -2) : pagePathPattern;
  });
};

const AiAssistantManagementModalSubstance = (): JSX.Element => {
  // Hooks
  const { t } = useTranslation();
  const { mutate: mutateAiAssistants } = useSWRxAiAssistants();
  const { data: aiAssistantManagementModalData, close: closeAiAssistantManagementModal } = useAiAssistantManagementModal();
  const { data: fetchedPageData } = useSWRxPagesByPaths(
    removeGlobPath(aiAssistantManagementModalData?.aiAssistantData?.pagePathPatterns) ?? null,
    undefined,
    true,
    true,
  );

  const aiAssistant = aiAssistantManagementModalData?.aiAssistantData;
  const shouldEdit = aiAssistant != null;
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


  // Effects
  useEffect(() => {
    if (shouldEdit) {
      setName(aiAssistant.name);
      setDescription(aiAssistant.description);
      setInstruction(aiAssistant.additionalInstruction);
      setSelectedShareScope(aiAssistant.shareScope);
      setSelectedAccessScope(aiAssistant.accessScope);
      setSelectedUserGroupsForShareScope(convertToPopulatedGrantedGroups(aiAssistant.grantedGroupsForShareScope ?? []));
      setSelectedUserGroupsForAccessScope(convertToPopulatedGrantedGroups(aiAssistant.grantedGroupsForAccessScope ?? []));
    }
  // eslint-disable-next-line max-len
  }, [aiAssistant?.accessScope, aiAssistant?.additionalInstruction, aiAssistant?.description, aiAssistant?.grantedGroupsForAccessScope, aiAssistant?.grantedGroupsForShareScope, aiAssistant?.name, aiAssistant?.pagePathPatterns, aiAssistant?.shareScope, shouldEdit]);

  useEffect(() => {
    if (shouldEdit && fetchedPageData != null) {
      setSelectedPages(convertToSelectedPages(aiAssistant.pagePathPatterns, fetchedPageData));
    }
  }, [aiAssistant?.pagePathPatterns, fetchedPageData, shouldEdit]);


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

      const grantedGroupsForShareScope = selectedShareScope === AiAssistantShareScope.GROUPS
        ? convertToGrantedGroups(selectedUserGroupsForShareScope)
        : undefined;

      const grantedGroupsForAccessScope = selectedAccessScope === AiAssistantAccessScope.GROUPS
        ? convertToGrantedGroups(selectedUserGroupsForAccessScope)
        : undefined;

      const reqBody = {
        name,
        description,
        additionalInstruction: instruction,
        pagePathPatterns,
        shareScope: selectedShareScope,
        accessScope: selectedAccessScope,
        grantedGroupsForShareScope,
        grantedGroupsForAccessScope,
      };

      if (shouldEdit) {
        await updateAiAssistant(aiAssistant._id, reqBody);
      }
      else {
        await createAiAssistant(reqBody);
      }

      toastSuccess(shouldEdit ? 'アシスタントが更新されました' : 'アシスタントが作成されました');
      mutateAiAssistants();
      closeAiAssistantManagementModal();
    }
    catch (err) {
      toastError(shouldEdit ? 'アシスタントの更新に失敗しました' : 'アシスタントの作成に失敗しました');
      logger.error(err);
    }
  // eslint-disable-next-line max-len
  }, [selectedPages, selectedShareScope, selectedUserGroupsForShareScope, selectedAccessScope, selectedUserGroupsForAccessScope, name, description, instruction, shouldEdit, mutateAiAssistants, closeAiAssistantManagementModal, aiAssistant?._id]);


  /*
  *  For AiAssistantManagementEditShare methods
  */
  const selectShareScopeHandler = useCallback((shareScope: AiAssistantShareScope) => {
    setSelectedShareScope(shareScope);
  }, []);

  const selectAccessScopeHandler = useCallback((accessScope: AiAssistantAccessScope) => {
    setSelectedAccessScope(accessScope);
  }, []);

  const selectShareScopeUserGroups = useCallback((targetUserGroup: PopulatedGrantedGroup) => {
    const selectedUserGroupIds = selectedUserGroupsForShareScope.map(userGroup => userGroup.item._id);
    if (selectedUserGroupIds.includes(targetUserGroup.item._id)) {
      // if selected, remove it
      setSelectedUserGroupsForShareScope(selectedUserGroupsForShareScope.filter(userGroup => userGroup.item._id !== targetUserGroup.item._id));
    }
    else {
      // if not selected, add it
      setSelectedUserGroupsForShareScope([...selectedUserGroupsForShareScope, targetUserGroup]);
    }
  }, [selectedUserGroupsForShareScope]);

  const selectAccessScopeUserGroups = useCallback((targetUserGroup: PopulatedGrantedGroup) => {
    const selectedUserGroupIds = selectedUserGroupsForAccessScope.map(userGroup => userGroup.item._id);
    if (selectedUserGroupIds.includes(targetUserGroup.item._id)) {
      // if selected, remove it
      setSelectedUserGroupsForAccessScope(selectedUserGroupsForAccessScope.filter(userGroup => userGroup.item._id !== targetUserGroup.item._id));
    }
    else {
      // if not selected, add it
      setSelectedUserGroupsForAccessScope([...selectedUserGroupsForAccessScope, targetUserGroup]);
    }
  }, [selectedUserGroupsForAccessScope]);


  /*
  *  For AiAssistantManagementEditPages methods
  */
  const selectPageHandler = useCallback((page: IPageForItem, isIncludeSubPage: boolean) => {
    const selectedPageIds = selectedPages.map(selectedPage => selectedPage.page._id);
    if (page._id != null && !selectedPageIds.includes(page._id)) {
      setSelectedPages([...selectedPages, { page, isIncludeSubPage }]);
    }
  }, [selectedPages]);

  const removePageHandler = useCallback((pagePath: string) => {
    setSelectedPages(selectedPages.filter(selectedPage => selectedPage.page.path !== pagePath));
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
            shouldEdit={shouldEdit}
            name={name}
            description={description}
            shareScope={selectedShareScope}
            instruction={instruction}
            selectedPages={selectedPages}
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
            onSelectShareScope={selectShareScopeHandler}
            onSelectAccessScope={selectAccessScopeHandler}
            onSelectAccessScopeUserGroups={selectAccessScopeUserGroups}
            onSelectShareScopeUserGroups={selectShareScopeUserGroups}
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
