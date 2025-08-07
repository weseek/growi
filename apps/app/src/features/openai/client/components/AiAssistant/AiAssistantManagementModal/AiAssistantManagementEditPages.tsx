import React, { useCallback, type JSX } from 'react';

import type { IPageHasId } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { ModalBody } from 'reactstrap';

import { useLimitLearnablePageCountPerAssistant } from '~/stores-universal/context';

import type { SelectedPage } from '../../../../interfaces/selected-page';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { PageSelectionMethodButtons } from './PageSelectionMethodButtons'; // Importing for side effects, if needed
import { SelectablePagePageList } from './SelectablePagePageList';

type Props = {
  selectedPages: SelectedPage[];
  onRemove: (pageId: string) => void;
}

export const AiAssistantManagementEditPages = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { data: limitLearnablePageCountPerAssistant } = useLimitLearnablePageCountPerAssistant();

  const { selectedPages, onRemove } = props;

  const removePageHandler = useCallback((page: IPageHasId) => {
    onRemove(page.path);
  }, [onRemove]);

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

          <SelectablePagePageList
            method="delete"
            methodButtonPosition="right"
            pages={selectedPages}
            onClickMethodButton={removePageHandler}
          />
        </div>
      </ModalBody>
    </>
  );
};
