import React, { useState, FC } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

export const DownloadDictModal: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} className="">
      <ModalHeader tag="h4" toggle={() => setIsModalOpen(false)} className="bg-warning">
        <i className="icon-fw icon-question" />
        Warning
      </ModalHeader>
      <ModalBody>
        Are you sure you want to download the dictionary file?
        <ModalFooter>
          {/* <div className="d-flex justify-content-end"> */}
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => console.log('button')}
          >
              Cancel
          </button>
          <button
            type="button"
            className="btn btn-outline-primary ml-3"
            onClick={() => console.log('button')}
          >
              Enable
          </button>
          {/* </div> */}
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};
