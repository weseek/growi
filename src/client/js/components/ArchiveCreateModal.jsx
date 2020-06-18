import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


const ArchiveCreateModal = (props) => {

  const [isCommentDownload, SetIsCommentDownload] = useState(false);
  const [isFileDownload, SetIsFileDownload] = useState(false);
  const [isSubordinatedPageDownload, SetIsSubordinatedPageDownload] = useState(false);


  function changeIsCommentDownloadHandler() {
    SetIsCommentDownload(true);
  }
  function changeIsFileDownloadHandler() {
    SetIsFileDownload(true);
  }

  function changeIsSubordinatedPageDownloadHandler() {
    SetIsSubordinatedPageDownload(true);
  }
  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-white">
        アーカイブを作成する
      </ModalHeader>
      <ModalBody>

        <div className="form-group">
          <div className="custom-control custom-radio custom-control-inline ">
            <label>ファイル形式: </label>
          </div>
          <div className="custom-control custom-radio custom-control-inline ">
            <input
              type="radio"
              className="custom-control-input"
            />
            <label className="custom-control-label">
              MarkDown(.md)
            </label>
          </div>
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
            />
            <label className="custom-control-label">
              PDF(.pdf)
            </label>
          </div>
        </div>


        <div className="custom-control custom-checkbox-success">
          <input
            className="custom-control-input"
            name="file_download"
            id="downloadFile"
            type="checkbox"
            checked={isCommentDownload}
            onChange={changeIsCommentDownloadHandler}
          />
          <label className="custom-control-label" htmlFor="isGitHubEnabled">
          コメントも含める
          </label>
        </div>
        <div className="custom-control custom-checkbox-success">
          <input
            className="custom-control-input"
            name="file_download"
            id="downloadFile"
            type="checkbox"
            checked={isFileDownload}
            onChange={changeIsFileDownloadHandler}
          />
          <label className="custom-control-label" htmlFor="isGitHubEnabled">
            添付ファイルも含める
          </label>
        </div>
        <div className="custom-control custom-checkbox-success">
          <input
            className="custom-control-input"
            name="file_download"
            id="downloadFile"
            type="checkbox"
            checked={isSubordinatedPageDownload}
            onChange={changeIsSubordinatedPageDownloadHandler}
          />
          <label className="custom-control-label" htmlFor="isGitHubEnabled">
            配下ページも含める
          </label>
        </div>
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
