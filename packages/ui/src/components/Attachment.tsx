import type { IAttachmentHasId } from '@growi/core';

import { UserPicture } from './UserPicture';

type AttachmentProps = {
  attachment: IAttachmentHasId,
  inUse: boolean,
  onAttachmentDeleteClicked?: (attachment: IAttachmentHasId) => void,
  isUserLoggedIn?: boolean,
};

export const Attachment = (props: AttachmentProps): JSX.Element => {

  const {
    attachment, inUse, isUserLoggedIn, onAttachmentDeleteClicked,
  } = props;

  const _onAttachmentDeleteClicked = () => {
    if (onAttachmentDeleteClicked != null) {
      onAttachmentDeleteClicked(attachment);
    }
  };

  const formatIcon = (attachment.fileFormat.match(/image\/.+/i)) ? 'icon-picture' : 'icon-doc';
  const btnDownload = (isUserLoggedIn)
    ? (
      <a className="attachment-download" href={attachment.downloadPathProxied}>
        <i className="icon-cloud-download" />
      </a>
    )
    : '';
  const btnTrash = (isUserLoggedIn)
    ? (
      <a className="text-danger attachment-delete" onClick={_onAttachmentDeleteClicked}>
        <i className="icon-trash" />
      </a>
    )
    : '';
  const fileType = <span className="attachment-filetype badge badge-pill badge-secondary">{attachment.fileFormat}</span>;
  const fileInUse = (inUse) ? <span className="attachment-in-use badge badge-pill badge-info">In Use</span> : '';

  return (
    <div className="attachment mb-2">
      <span className="mr-1 attachment-userpicture">
        <UserPicture user={attachment.creator} size="sm"></UserPicture>
      </span>
      <a className="mr-2" href={attachment.filePathProxied} target="_blank" rel="noopener noreferrer">
        <i className={formatIcon}></i> {attachment.originalName}
      </a>
      <span className="mr-2">{fileType}</span>
      <span className="mr-2">{fileInUse}</span>
      <span className="mr-2">{btnDownload}</span>
      <span className="mr-2">{btnTrash}</span>
    </div>
  );
};
