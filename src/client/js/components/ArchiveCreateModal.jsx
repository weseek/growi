import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

const ArchiveCreateModal = (props) => {

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-Light">
        アーカイブを作成する
      </ModalHeader>
      <ModalBody>
        <input type="checkbox" />
        <label>コメントもダウンロードする</label>
        <input type="checkbox" />
        <label>ファイルもダウンロードする</label>
        <input type="checkbox" />
        <label>配下ページもダウンロードする</label>
      </ModalBody>
    </Modal>
  );
};

ArchiveCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ArchiveCreateModal;
