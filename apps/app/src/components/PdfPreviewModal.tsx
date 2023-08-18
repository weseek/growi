import React, { useCallback, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { Document, Page } from 'react-pdf';
import {
  Button, Modal, ModalBody, ModalFooter,
} from 'reactstrap';

import { usePdfPreviewModal } from '~/stores/modal';

export const PdfPreviewModal: React.FC = () => {
  const { t } = useTranslation();
  const { data: pdfPreviewModalData, close: closePdfPreviewModal } = usePdfPreviewModal();
  const isOpen = pdfPreviewModalData?.isOpened;
  const url = pdfPreviewModalData?.url;
  const options = pdfPreviewModalData?.options;

  const [numOfPages, setNumOfPages] = useState(1);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumOfPages(numPages);
  }, []);

  const onClickPreviousPageButtonHandler = useCallback(() => {
    if (currentPageNumber > 1) {
      setCurrentPageNumber(currentPageNumber - 1);
    }
  }, [currentPageNumber]);

  const onClickNextPageButtonHandler = useCallback(() => {
    if (currentPageNumber < numOfPages) {
      setCurrentPageNumber(currentPageNumber + 1);
    }
  }, [currentPageNumber, numOfPages]);

  const onClickCloseButtonHandler = useCallback(() => {
    closePdfPreviewModal();
    setCurrentPageNumber(1);
  }, [closePdfPreviewModal]);

  // TODO: Create PdfPreviewModal stracture design
  // https://redmine.weseek.co.jp/issues/128826
  return (
    <Modal
      isOpen={isOpen}
    >
      <ModalBody>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          <Page pageNumber={currentPageNumber} />
        </Document>
      </ModalBody>
      <ModalFooter>
        <p>Page {currentPageNumber} of {numOfPages}</p>
        <Button
          color="danger"
          onClick={onClickPreviousPageButtonHandler}
        >Previous
        </Button>
        <Button
          color="danger"
          onClick={onClickNextPageButtonHandler}
        >Next
        </Button>
        <Button
          color="danger"
          onClick={onClickCloseButtonHandler}
        >{t('commons:Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
