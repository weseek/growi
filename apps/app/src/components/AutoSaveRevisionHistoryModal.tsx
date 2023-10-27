import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useAutoSaveRevisionHistoryModal } from '~/stores/modal';

import { AutoSaveRevisionHistoryTable } from './AutoSaveRevisionHistoryTable';


export const AutoSaveRevisionHistoryModal = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: autoSaveRevisionHistoryModalData, close: closeAutoSaveRevisionHistoryModal } = useAutoSaveRevisionHistoryModal();

  return (
    <Modal
      size="lg"
      isOpen={autoSaveRevisionHistoryModalData?.isOpened}
      toggle={closeAutoSaveRevisionHistoryModal}
      data-testid="auto-save-revision-history-modal"
    >
      <ModalHeader
        tag="h4"
        toggle={closeAutoSaveRevisionHistoryModal}
        className="bg-primary text-light"
      >
        Header
      </ModalHeader>
      <ModalBody>
        <div data-testid="auto-save-revision-history-table">
          {/* {currentPageId != null && currentPagePath != null && (
            <AutoSaveRevisionHistoryTable
              sourceRevisionId={comparingRevisions?.sourceRevisionId}
              targetRevisionId={comparingRevisions?.targetRevisionId}
              currentPageId={currentPageId}
              currentPagePath={currentPagePath}
              onClose={onClose}
            />
          )} */}
        </div>
      </ModalBody>
      <ModalFooter>
        Footer
      </ModalFooter>
    </Modal>
  );
};
