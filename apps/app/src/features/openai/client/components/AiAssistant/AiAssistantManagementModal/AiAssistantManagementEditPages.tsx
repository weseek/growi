import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { ModalBody } from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { usePageSelectModal } from '~/stores/modal';

import { LIMIT_LEARNABLE_PAGE_COUNT } from '../../../../interfaces/ai-assistant';
import type { SelectedPage } from '../../../../interfaces/selected-page';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectedPageList } from './SelectedPageList';


type Props = {
  selectedPages: SelectedPage[];
  onSelect: (page: IPageForItem, isIncludeSubPage: boolean) => void;
  onRemove: (pageId: string) => void;
}

export const AiAssistantManagementEditPages = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { selectedPages, onSelect, onRemove } = props;

  const { open: openPageSelectModal } = usePageSelectModal();

  const clickOpenPageSelectModalHandler = useCallback(() => {
    openPageSelectModal({ onSelected: onSelect, isHierarchicalSelectionMode: true });
  }, [onSelect, openPageSelectModal]);

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <p
          className="text-secondary py-1"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('modal_ai_assistant.edit_page_description', { limitLearnablePageCount: LIMIT_LEARNABLE_PAGE_COUNT }) }}
        />

        <button
          type="button"
          onClick={clickOpenPageSelectModalHandler}
          className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-center"
        >
          <span className="material-symbols-outlined me-2">add</span>
          ページを追加する
        </button>

        <SelectedPageList selectedPages={selectedPages} onRemove={onRemove} />
      </ModalBody>
    </>
  );
};
