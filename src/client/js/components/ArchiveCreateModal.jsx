import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


const ArchiveCreateModal = (props) => {

  const { t } = props;

  const [isCommentDownload, setIsCommentDownload] = useState(false);
  const [isFileDownload, setIsFileDownload] = useState(false);
  const [isSubordinatedPageDownload, setIsSubordinatedPageDownload] = useState(false);


  function changeIsCommentDownloadHandler() {
    setIsCommentDownload(true);
  }
  function changeIsFileDownloadHandler() {
    setIsFileDownload(true);
  }

  function changeIsSubordinatedPageDownloadHandler() {
    setIsSubordinatedPageDownload(true);
  }
  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-white">
        {t('Create Archive Page')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <div className="custom-control custom-radio custom-control-inline ">
            <label>{t('File type')}: </label>
          </div>
          <div className="custom-control custom-radio custom-control-inline ">
            <input type="radio" className="custom-control-input" />
            <label className="custom-control-label">MarkDown(.md)</label>
          </div>
          <div className="custom-control custom-radio custom-control-inline">
            <input type="radio" className="custom-control-input" />
            <label className="custom-control-label">PDF(.pdf)</label>
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
            {t('Include Comment')}
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
            {t('Include Attachment File')}
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
            {('Include Subordinated Page')}
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
  t: PropTypes.func.isRequired, //  i18next
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withTranslation()(ArchiveCreateModal);
