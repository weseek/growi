import React from 'react';
import PropTypes from 'prop-types';

import UserPicture from '../User/UserPicture';

export default class Attachment extends React.Component {

  constructor(props) {
    super(props);

    this._onAttachmentDeleteClicked = this._onAttachmentDeleteClicked.bind(this);
  }

  iconNameByFormat(format) {
    if (format.match(/image\/.+/i)) {
      return 'icon-picture';
    }

    return 'icon-doc';
  }

  _onAttachmentDeleteClicked(event) {
    if (this.props.onAttachmentDeleteClicked != null) {
      this.props.onAttachmentDeleteClicked(this.props.attachment);
    }
  }

  render() {
    const attachment = this.props.attachment;
    const formatIcon = this.iconNameByFormat(attachment.fileFormat);

    let fileInUse = '';
    if (this.props.inUse) {
      fileInUse = <span className="attachment-in-use badge badge-pill badge-info">In Use</span>;
    }

    const fileType = <span className="attachment-filetype badge badge-pill badge-secondary">{attachment.fileFormat}</span>;

    const btnDownload = (this.props.isUserLoggedIn)
      ? (
        <a className="attachment-download" href={attachment.downloadPathProxied}>
          <i className="icon-cloud-download" />
        </a>
      )
      : '';

    const btnTrash = (this.props.isUserLoggedIn)
      ? (
        /* eslint-disable-next-line */
        <a className="text-danger attachment-delete" onClick={this._onAttachmentDeleteClicked}>
          <i className="icon-trash" />
        </a>
      )
      : '';

    return (
      <div className="attachment mb-2">
        <span className="mr-1 attachment-userpicture">
          <UserPicture user={attachment.creator} size="sm"></UserPicture>
        </span>
        <a className="mr-2" href={attachment.filePathProxied}><i className={formatIcon}></i> {attachment.originalName}</a>
        <span className="mr-2">{fileType}</span>
        <span className="mr-2">{fileInUse}</span>
        <span className="mr-2">{btnDownload}</span>
        <span className="mr-2">{btnTrash}</span>
      </div>
    );
  }

}

Attachment.propTypes = {
  attachment: PropTypes.object.isRequired,
  inUse: PropTypes.bool,
  onAttachmentDeleteClicked: PropTypes.func,
  isUserLoggedIn: PropTypes.bool,
};

Attachment.defaultProps = {
  inUse: false,
  isUserLoggedIn: false,
};
