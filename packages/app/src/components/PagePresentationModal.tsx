import React, { useCallback } from 'react';

import type { PresentationProps } from '@growi/presentation';
import dynamic from 'next/dynamic';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import {
  Modal, ModalBody,
} from 'reactstrap';


import { usePagePresentationModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { usePresentationViewOptions } from '~/stores/renderer';
import { useNextThemes } from '~/stores/use-next-themes';


import styles from './PagePresentationModal.module.scss';


const Presentation = dynamic<PresentationProps>(() => import('@growi/presentation').then(mod => mod.Presentation), {
  ssr: false,
  loading: () => (
    <i className="fa fa-4x fa-spinner fa-pulse text-muted"></i>
  ),
});


const PagePresentationModal = (): JSX.Element => {

  const { data: presentationModalData, close: closePresentationModal } = usePagePresentationModal();

  const { isDarkMode } = useNextThemes();

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: rendererOptions } = usePresentationViewOptions();

  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen();
  }, []);

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
      <div className="grw-presentation-controls d-flex">
        <button className="close btn-fullscreen" type="button" aria-label="fullscreen" onClick={requestFullscreen}>
          <i className="ti ti-fullscreen" aria-hidden></i>
        </button>
        <button className="close btn-close" type="button" aria-label="close" onClick={closePresentationModal}>
          <i className="ti ti-close" aria-hidden></i>
        </button>
      </div>
      <ModalBody className="modal-body d-flex justify-content-center align-items-center">
        { rendererOptions != null && (
          <Presentation
            options={{
              rendererOptions: rendererOptions as ReactMarkdownOptions,
              revealOptions: {
                embedded: true,
                hash: true,
              },
              isDarkMode,
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
