import React, { useCallback, type JSX } from 'react';

import { useTranslation } from 'react-i18next';
import { ModalBody } from 'reactstrap';

import type { IPageForItem } from '~/interfaces/page';
import { useLimitLearnablePageCountPerAssistant } from '~/stores-universal/context';
import { usePageSelectModal } from '~/stores/modal';

import type { SelectedPage } from '../../../../interfaces/selected-page';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { PageSelectionMethodButtons } from './PageSelectionMethodButtons'; // Importing for side effects, if needed
import { SelectablePagePageList } from './SelectablePagePageList';
import { SelectedPageList } from './SelectedPageList';


type Props = {
  selectedPages: SelectedPage[];
  onSelect: (page: IPageForItem, isIncludeSubPage: boolean) => void;
  onRemove: (pageId: string) => void;
}

export const AiAssistantManagementEditPages = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { data: limitLearnablePageCountPerAssistant } = useLimitLearnablePageCountPerAssistant();

  const { selectedPages, onSelect, onRemove } = props;

  const pages = selectedPages.map(selectedPageData => selectedPageData.page);

  const { open: openPageSelectModal } = usePageSelectModal();

  const clickOpenPageSelectModalHandler = useCallback(() => {
    openPageSelectModal({ onSelected: onSelect, isHierarchicalSelectionMode: true });
  }, [onSelect, openPageSelectModal]);

  return (
    <>
      <AiAssistantManagementHeader labelTranslationKey="modal_ai_assistant.page_mode_title.pages" />

      <ModalBody className="px-4">
        <div className="px-4">
          <p
            className="text-secondary"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('modal_ai_assistant.edit_page_description', { limitLearnablePageCountPerAssistant }) }}
          />

          <div className="mb-3">
            <PageSelectionMethodButtons />
          </div>

          {/* <button
            type="button"
            onClick={clickOpenPageSelectModalHandler}
            className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-center"
          >
            <span className="material-symbols-outlined me-2">add</span>
            {t('modal_ai_assistant.add_page_button')}
          </button> */}

          {/* <SelectedPageList selectedPages={selectedPages} onRemove={onRemove} /> */}

          <div className="">
            <SelectablePagePageList
              method="delete"
              methodButtonPosition="right"
              pages={pages}
              onClickMethodButton={() => {}}
            />
          </div>
        </div>
      </ModalBody>
    </>
  );
};
