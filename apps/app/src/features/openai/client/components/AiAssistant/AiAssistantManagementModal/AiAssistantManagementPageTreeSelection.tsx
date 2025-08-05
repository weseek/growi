import React, {
  Suspense, useCallback, useState, memo,
} from 'react';

import type { IPageHasId } from '@growi/core';
import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import { ItemsTree } from '~/client/components/ItemsTree';
import ItemsTreeContentSkeleton from '~/client/components/ItemsTree/ItemsTreeContentSkeleton';
import type { TreeItemProps } from '~/client/components/TreeItem';
import { TreeItemLayout } from '~/client/components/TreeItem';
import type { IPageForItem } from '~/interfaces/page';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores-universal/context';

import { AiAssistantManagementModalPageMode, useAiAssistantManagementModal } from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectablePagePageList } from './SelectablePagePageList';

import styles from './AiAssistantManagementPageTreeSelection.module.scss';

const moduleClass = styles['grw-ai-assistant-management-page-tree-selection'] ?? '';

export const isIPageHasId = (value?: IPageForItem): value is IPageHasId => {
  if (value == null) {
    return false;
  }
  return value._id != null && value.path != null;
};


const SelectablePageTree = memo((props: { onClickAddPageButton: (page: IPageHasId) => void }) => {
  const { onClickAddPageButton } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const pageTreeItemHandler = useCallback((page: IPageForItem) => {
    if (!isIPageHasId(page)) {
      return;
    }

    onClickAddPageButton(page);
  }, [onClickAddPageButton]);

  const PageTreeItem = (props: TreeItemProps) => {
    const { itemNode } = props;
    const { page } = itemNode;

    const SelectPageButton = () => {
      return (
        <button
          type="button"
          className="border-0 rounded btn p-0"
          onClick={(e) => {
            e.stopPropagation();
            pageTreeItemHandler(page);
          }}
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
});


export const AiAssistantManagementPageTreeSelection = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  const [selectedPages, setSelectedPages] = useState<Map<string, IPageHasId>>(new Map());

  const addPageHandler = useCallback((page: IPageHasId) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      newMap.set(page._id, page);
      return newMap;
    });
  }, []);

  const removePageHandler = useCallback((page: IPageHasId) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(page._id);
      return newMap;
    });
  }, []);


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
            <SelectablePageTree onClickAddPageButton={addPageHandler} />
          </div>
        </Suspense>

        <h4 className="text-center fw-bold mb-3 mt-4">
          {t('modal_ai_assistant.reference_pages')}
        </h4>

        <div className="px-4">
          <SelectablePagePageList
            pages={Array.from(selectedPages.values())}
            method="remove"
            onClickMethodButton={removePageHandler}
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
