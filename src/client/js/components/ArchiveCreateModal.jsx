import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

const ArchiveCreateModal = (props) => {

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-secondary text-Light">
        アーカイブを作成する
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <div className="custom-control" custom-checkbox>
            <input type="checkbox" />コメントもダウンロードする
          </div>
        </div>
        <div className="form-group">
          <div className="custom-control" custom-checkbox>
            <input type="checkbox" />ファイルもダウンロードする
          </div>
        </div>
        <div className="form-group">
          <div className="custom-control" custom-checkbox>
            <input type="checkbox" />配下ページもダウンロードする
          </div>
        </div>
        <button type="button">アーカイブを作成する</button>

      </ModalBody>
    </Modal>
  );
};

ArchiveCreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ArchiveCreateModal;
