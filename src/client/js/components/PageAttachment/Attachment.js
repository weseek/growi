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
    this.props.onAttachmentDeleteClicked(this.props.attachment);
  }

  render() {
    const attachment = this.props.attachment;
    const formatIcon = this.iconNameByFormat(attachment.fileFormat);

    let fileInUse = '';
    if (this.props.inUse) {
      fileInUse = <span className="attachment-in-use label label-info">In Use</span>;
    }

    const fileType = <span className="attachment-filetype label label-default">{attachment.fileFormat}</span>;

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
      <li className="attachment">
        <span className="mr-1 attachment-userpicture">
          <UserPicture user={attachment.creator} size="sm"></UserPicture>
        </span>

        <a href={attachment.filePathProxied}><i className={formatIcon}></i> {attachment.originalName}</a>

        {fileType}

        {fileInUse}

        {btnDownload}
        {btnTrash}
      </li>
    );
  }

}

Attachment.propTypes = {
  attachment: PropTypes.object.isRequired,
  inUse: PropTypes.bool.isRequired,
  onAttachmentDeleteClicked: PropTypes.func.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
};

Attachment.defaultProps = {
};
