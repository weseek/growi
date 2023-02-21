import React from 'react';

type AttachmentProps = {
  className?: string,
  url: string,
  attachmentName: string,
  attachmentId: string,
}

export const Attachment = React.memo((props: AttachmentProps): JSX.Element => {
  const { className, url, attachmentName } = props;

  return (
    <div className="card">
      <h3 className="card-title m-0">Remark Attachment Component</h3>
      <div className="card-body">
        <a className={className} href={url}>
          {attachmentName}
        </a>
      </div>
    </div>
  );
});
Attachment.displayName = 'Attachment';
