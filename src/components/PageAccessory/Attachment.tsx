import React, { useCallback, VFC } from 'react';
import UserPicture from '~/client/js/components/User/UserPicture';
import { Attachment as IAttachment } from '~/interfaces/page';

type Props = {
  attachment: IAttachment,
  inUse: boolean,
  isUserLoggedIn: boolean,
  onAttachmentDeleteClicked:(attachment:IAttachment)=> void,
}

export const Attachment:VFC<Props> = (props:Props) => {
  const {
    attachment, inUse = false, isUserLoggedIn = false, onAttachmentDeleteClicked,
  } = props;

  const iconNameByFormat = (format) => {
    if (format.match(/image\/.+/i)) {
      return 'icon-picture';
    }

    return 'icon-doc';
  };

  const handleDeleteAttachmentButton = useCallback(() => {
    if (onAttachmentDeleteClicked != null) {
      onAttachmentDeleteClicked(attachment);
    }
  }, [onAttachmentDeleteClicked, attachment]);

  const formatIcon = iconNameByFormat(attachment.fileFormat);

  const fileInUse = (inUse) ? <span className="attachment-in-use badge badge-pill badge-info">In Use</span> : <></>;

  const fileType = <span className="attachment-filetype badge badge-pill badge-secondary">{attachment.fileFormat}</span>;

  const btnDownload = (isUserLoggedIn)
    ? (
      <a className="attachment-download" href={attachment.downloadPathProxied}>
        <i className="icon-cloud-download" />
      </a>
    )
    : '';

  const btnTrash = (isUserLoggedIn)
    ? (
        /* eslint-disable-next-line */
        <a className="text-danger attachment-delete" onClick={handleDeleteAttachmentButton}>
          <i className="icon-trash" />
        </a>
    )
    : '';

  return (
    <div className="attachment mb-2">
      <span className="mr-1 attachment-userpicture">
        <UserPicture user={attachment.creator} size="sm" />
      </span>
      <a className="mr-2" href={attachment.filePathProxied}><i className={formatIcon}></i> {attachment.originalName}</a>
      <span className="mr-2">{fileType}</span>
      <span className="mr-2">{fileInUse}</span>
      <span className="mr-2">{btnDownload}</span>
      <span className="mr-2">{btnTrash}</span>
    </div>
  );

};
