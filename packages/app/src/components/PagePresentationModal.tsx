import React from 'react';

import { Presentation } from '@growi/presentation';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import {
  Modal, ModalBody,
} from 'reactstrap';


import { usePagePresentationModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { usePresentationViewOptions } from '~/stores/renderer';


import styles from './PagePresentationModal.module.scss';

const PagePresentationModal = (): JSX.Element => {

  const { data: presentationModalData, close: closePresentationModal } = usePagePresentationModal();

  const { data: currentPage } = useSWRxCurrentPage();
  // const { data: rendererOptions } = usePresentationViewOptions();

  const isOpen = presentationModalData?.isOpened ?? false;

  if (!isOpen) {
    return <></>;
  }

  const markdown = currentPage?.revision.body;

  return (
    <Modal
      isOpen={isOpen}
      toggle={closePresentationModal}
      data-testid="page-presentation-modal"
      className={`grw-presentation-modal ${styles['grw-presentation-modal']} grw-body-only-modal-expanded`}
      unmountOnClose={false}
    >
      <ModalBody className="modal-body">
        {/* { markdown != null && (
          <ReactMarkdown {...rendererOptions}>
            {markdown}
          </ReactMarkdown>
        )} */}
        <Presentation>{markdown}</Presentation>
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
