/* eslint-disable react/prop-types */
import React from 'react';
import Button from 'react-bootstrap/es/Button';
import Modal from 'react-bootstrap/es/Modal';

import UserPicture from '../User/UserPicture';
import Username from '../User/Username';

export default class DeleteAttachmentModal extends React.Component {

  constructor(props) {
    super(props);

    this._onDeleteConfirm = this._onDeleteConfirm.bind(this);
  }

  _onDeleteConfirm() {
    this.props.onAttachmentDeleteClickedConfirm(this.props.attachmentToDelete);
  }

  iconNameByFormat(format) {
    if (format.match(/image\/.+/i)) {
      return 'icon-picture';
    }

    return 'icon-doc';
  }

  renderByFileFormat(attachment) {
    const content = (attachment.fileFormat.match(/image\/.+/i))
      ? <img src={attachment.filePathProxied} alt="deleting image" />
      : '';


    return (
      <div className="attachment-delete-image">
        <p>
          <i className={this.iconNameByFormat(attachment.fileFormat)}></i> {attachment.originalName}
        </p>
        <p>
          uploaded by <UserPicture user={attachment.creator} size="sm"></UserPicture> <Username user={attachment.creator}></Username>
        </p>
        {content}
      </div>
    );
  }

  render() {
    const attachment = this.props.attachmentToDelete;
    if (attachment === null) {
      return null;
    }

    const props = Object.assign({}, this.props);
    delete props.onAttachmentDeleteClickedConfirm;
    delete props.attachmentToDelete;
    delete props.inUse;
    delete props.deleting;
    delete props.deleteError;

    let deletingIndicator = '';
    if (this.props.deleting) {
      deletingIndicator = <div className="speeding-wheel-sm"></div>;
    }
    if (this.props.deleteError) {
      deletingIndicator = <span>{this.props.deleteError}</span>;
    }

    const renderAttachment = this.renderByFileFormat(attachment);

    return (
      <Modal {...props} className="attachment-delete-modal" bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Delete attachment?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderAttachment}
        </Modal.Body>
        <Modal.Footer>
          <div className="mr-3 d-inline-block">
            {deletingIndicator}
          </div>
          <Button
            onClick={this._onDeleteConfirm}
            bsStyle="danger"
            disabled={this.props.deleting}
          >Delete!
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

}
