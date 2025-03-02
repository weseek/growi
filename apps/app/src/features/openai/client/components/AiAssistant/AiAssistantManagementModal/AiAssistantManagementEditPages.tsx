import React, { useCallback } from 'react';

import { ModalBody } from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { usePageSelectModal } from '~/stores/modal';

import type { SelectedPage } from '../../../../interfaces/selected-page';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectedPageList } from './SelectedPageList';


type Props = {
  selectedPages: SelectedPage[];
  onSelect: (page: IPageForItem, isIncludeSubPage: boolean) => void;
  onRemove: (pageId: string) => void;
}

export const AiAssistantManagementEditPages = (props: Props): JSX.Element => {
  const { selectedPages, onSelect, onRemove } = props;

  const { open: openPageSelectModal } = usePageSelectModal();

  const clickOpenPageSelectModalHandler = useCallback(() => {
    openPageSelectModal({ onSelected: onSelect, isHierarchicalSelectionMode: true });
  }, [onSelect, openPageSelectModal]);

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <p className="text-secondary py-1">
          アシスタントが参照するページを編集します。<br />
          参照できるページは配下ページも含めて200ページまでです。
        </p>

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
