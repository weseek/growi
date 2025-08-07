import React, {
  Suspense, useCallback, memo, useMemo,
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

import { type SelectedPage, isSelectedPage } from '../../../../interfaces/selected-page';
import { useSelectedPages } from '../../../services/use-selected-pages';
import { AiAssistantManagementModalPageMode, useAiAssistantManagementModal } from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectablePagePageList } from './SelectablePagePageList';

import styles from './AiAssistantManagementPageTreeSelection.module.scss';

const moduleClass = styles['grw-ai-assistant-management-page-tree-selection'] ?? '';

const SelectablePageTree = memo((props: { onClickAddPageButton: (page: SelectedPage) => void }) => {
  const { onClickAddPageButton } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  const pageTreeItemClickHandler = useCallback((page: IPageForItem) => {
    if (!isSelectedPage(page)) {
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
          className="border-0 rounded btn p-0 me-2"
          onClick={(e) => {
            e.stopPropagation();
            pageTreeItemClickHandler(page);
          }}
        >
          <span className="material-symbols-outlined p-0 me-2 text-primary">add_circle</span>
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
    <div className="page-tree-item">
      <ItemsTree
        targetPath="/"
        isEnableActions={!isGuestUser}
        isReadOnlyUser={!!isReadOnlyUser}
        CustomTreeItem={PageTreeItem}
      />
    </div>
  );
});

type Props = {
  baseSelectedPages: SelectedPage[],
  updateBaseSelectedPages: (pages: SelectedPage[]) => void;
}

export const AiAssistantManagementPageTreeSelection = (props: Props): JSX.Element => {
  const { baseSelectedPages, updateBaseSelectedPages } = props;

  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData, changePageMode } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  const {
    selectedPages, addPage, removePage, clearPages,
  } = useSelectedPages(baseSelectedPages);

  // SelectedPages will include subordinate pages by default
  const pagesWithGlobPath = useMemo(() => {
    return Array.from(selectedPages.values()).map((page) => {
      if (page.path === '/') {
        page.path = '/*';
      }

      if (!page.path.endsWith('/*')) {
        page.path = `${page.path}/*`;
      }

      return page;
    });
  }, [selectedPages]);

  const nextButtonClickHandler = useCallback(() => {
    updateBaseSelectedPages(Array.from(selectedPages.values()));
    changePageMode(isNewAiAssistant ? AiAssistantManagementModalPageMode.HOME : AiAssistantManagementModalPageMode.PAGES);
    clearPages();
  }, [changePageMode, clearPages, isNewAiAssistant, selectedPages, updateBaseSelectedPages]);

  return (
    <div className={moduleClass}>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={isNewAiAssistant ? AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD : AiAssistantManagementModalPageMode.PAGES}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center fw-bold mb-3 mt-2">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>

        <Suspense fallback={<ItemsTreeContentSkeleton />}>
          <div className="px-4">
            <SelectablePageTree onClickAddPageButton={addPage} />
          </div>
        </Suspense>

        <h4 className="text-center fw-bold mb-3 mt-4">
          {t('modal_ai_assistant.reference_pages')}
        </h4>

        <div className="px-4">
          <SelectablePagePageList
            method="remove"
            methodButtonPosition="right"
            pages={pagesWithGlobPath ?? []}
            onClickMethodButton={removePage}
          />
          <label className="form-text text-muted mt-2">
            {t('modal_ai_assistant.can_add_later')}
          </label>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button
            type="button"
            className="btn btn-primary rounded next-button"
            disabled={selectedPages.size === 0}
            onClick={nextButtonClickHandler}
          >
            {t('modal_ai_assistant.next')}
          </button>
        </div>
      </ModalBody>
    </div>
  );
};
