import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


const ArchiveCreateModal = (props) => {

  const [isFileDownload, SetIsFileDownload] = useState(false);

  function changeIsFileDownloadHandler() {
    SetIsFileDownload(true);
  }
  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-white">
        アーカイブを作成する
      </ModalHeader>
      <ModalBody>
        <input
          className="custom-control-input"
          name="file_download"
          id="downloadFile"
          type="checkbox"
          checked={isFileDownload}
          onChange={changeIsFileDownloadHandler}
        />試作
      </ModalBody>
      <ModalFooter>
        <button type="button">Done</button>
      </ModalFooter>
    </Modal>

  );
};

ArchiveCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ArchiveCreateModal;
