import React from 'react';

import { useTranslation } from 'react-i18next';
import {
  ModalBody,
} from 'reactstrap';

import { ItemsTree } from '~/client/components/ItemsTree';
import type { TreeItemProps, TreeItemToolProps } from '~/client/components/TreeItem';
import { TreeItemLayout, useNewPageInput } from '~/client/components/TreeItem';

import { AiAssistantManagementModalPageMode, useAiAssistantManagementModal } from '../../../stores/ai-assistant';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectablePagePageList } from './SelectablePagePageList';


const PageTreeItem = (props : TreeItemProps): JSX.Element => {
  const { itemNode, targetPathOrId } = props;
  const { page } = itemNode;

  const SelectPageButton = () => {
    return (
      <button
        id="page-create-button-in-page-tree"
        type="button"
        className="border-0 rounded btn btn-page-it p-0"
      >
        <span className="material-symbols-outlined p-0 text-primary">add_circle</span>
      </button>
    );
  };

  return (
    <TreeItemLayout
      {...props}
      itemClass={PageTreeItem}
      // itemClassName={itemClassNames.join(' ')}
      customHoveredEndComponents={[SelectPageButton]}
    />
  );
};


export const AiAssistantManagementPageTreeSelection = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: aiAssistantManagementModalData, changePageMode } = useAiAssistantManagementModal();
  const isNewAiAssistant = aiAssistantManagementModalData?.aiAssistantData == null;

  return (
    <>
      <AiAssistantManagementHeader
        backButtonColor="secondary"
        backToPageMode={AiAssistantManagementModalPageMode.PAGE_SELECTION_METHOD}
        labelTranslationKey={isNewAiAssistant ? 'modal_ai_assistant.header.add_new_assistant' : 'modal_ai_assistant.header.update_assistant'}
      />

      <ModalBody className="px-4">
        <h4 className="text-center fw-bold mb-3 mt-2">
          {t('modal_ai_assistant.search_reference_pages_by_keyword')}
        </h4>

        <ItemsTree
          isEnableActions
          isReadOnlyUser={false}
          targetPath="/"
          CustomTreeItem={PageTreeItem}
        />

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
            style={{ width: '30%' }}
          >
            {t('modal_ai_assistant.next')}
          </button>
        </div>
      </ModalBody>
    </>
  );
};
