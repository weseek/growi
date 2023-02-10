import React from 'react';

import dynamic from 'next/dynamic';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import {
  Modal, ModalBody,
} from 'reactstrap';


import { usePagePresentationModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { usePresentationViewOptions } from '~/stores/renderer';


import styles from './PagePresentationModal.module.scss';


const Presentation = dynamic(() => import('@growi/presentation').then(mod => mod.Presentation), {
  ssr: false,
  loading: () => (
    <i className="fa fa-4x fa-spinner fa-pulse text-muted"></i>
  ),
});


const PagePresentationModal = (): JSX.Element => {

  const { data: presentationModalData, close: closePresentationModal } = usePagePresentationModal();

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: rendererOptions } = usePresentationViewOptions();

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
      className={`grw-presentation-modal ${styles['grw-presentation-modal']}`}
    >
      <button className="close" type="button" aria-label="close" onClick={closePresentationModal}>
        <span className="text-white" aria-hidden>×</span>
      </button>
      <ModalBody className="modal-body d-flex justify-content-center align-items-center">
        { rendererOptions != null && (
          <Presentation
            rendererOptions={rendererOptions as ReactMarkdownOptions}
            revealOptions={{
              embedded: true,
              hash: true,
              disableLayout: true,
            }}
          >
            {markdown}
          </Presentation>
        ) }
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
