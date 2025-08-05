import React, { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import { ItemsTree } from '~/client/components/ItemsTree';
import ItemsTreeContentSkeleton from '~/client/components/ItemsTree/ItemsTreeContentSkeleton';
import type { TreeItemProps, TreeItemToolProps } from '~/client/components/TreeItem';
import { TreeItemLayout, useNewPageInput } from '~/client/components/TreeItem';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores-universal/context';

import { AiAssistantManagementModalPageMode, useAiAssistantManagementModal } from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectablePagePageList } from './SelectablePagePageList';

import styles from './AiAssistantManagementPageTreeSelection.module.scss';

const moduleClass = styles['grw-ai-assistant-management-page-tree-selection'] ?? '';


const SelectablePageTree = () => {
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const PageTreeItem = (props: TreeItemProps) => {
    const { itemNode, targetPathOrId } = props;
    const { page } = itemNode;

    const SelectPageButton = () => {
      return (
        <button
          type="button"
          className="border-0 rounded btn p-0"
        >
          <span className="material-symbols-outlined p-0 me-3 text-primary">add_circle</span>
        </button>
      );
    };

    return (
      <TreeItemLayout
        {...props}
        itemClass={PageTreeItem}
        className=" text-muted"
        customHoveredEndComponents={[SelectPageButton]}
      />
    );
  };

  return (
    <ItemsTree
      isEnableActions={!isGuestUser}
      isReadOnlyUser={!!isReadOnlyUser}
      targetPath="/"
      CustomTreeItem={PageTreeItem}
    />
  );
};


export const AiAssistantManagementPageTreeSelection = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData, changePageMode } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  return (
    <div className={moduleClass}>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center fw-bold mb-3 mt-2">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>

        <Suspense fallback={<ItemsTreeContentSkeleton />}>
          <div className="px-4">
            <SelectablePageTree />
          </div>
        </Suspense>

        <h4 className="text-center fw-bold mb-3 mt-4">
          {t('modal_ai_assistant.reference_pages')}
        </h4>

        <div className="px-4">
          <SelectablePagePageList
            pages={[]}
            method="remove"
            onClickMethodButton={() => {}}
          />
          <label className="form-text text-muted mt-2">
            {t('modal_ai_assistant.can_add_later')}
          </label>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="btn btn-primary rounded next-button"
          >
            {t('modal_ai_assistant.next')}
          </button>
        </div>
      </ModalBody>
    </div>
  );
};
