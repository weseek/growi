import React from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { useSearchModal } from '~/stores/modal';

const SearchModal = (): JSX.Element => {
  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  return (
    <Modal isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalHeader>
        header
      </ModalHeader>

      <ModalBody>
        body
      </ModalBody>

      <ModalFooter>
        footer
      </ModalFooter>
    </Modal>
  );
};

export default SearchModal;
