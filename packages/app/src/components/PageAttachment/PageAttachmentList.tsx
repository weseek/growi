import React from 'react';


import { HasObjectId, IAttachment } from '@growi/core';
import { Attachment } from '@growi/ui';
import { useTranslation } from 'next-i18next';


type Props = {
  attachments: (IAttachment & HasObjectId)[],
  inUse: { [id: string]: boolean },
  onAttachmentDeleteClicked?: (attachment: IAttachment & HasObjectId) => void,
  isUserLoggedIn?: boolean,
}

export const PageAttachmentList = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    attachments, inUse, onAttachmentDeleteClicked, isUserLoggedIn,
  } = props;

  if (attachments.length === 0) {
    return <>{t('No_attachments_yet')}</>;
  }

  const attachmentList = attachments.map((attachment) => {
    return (
      <Attachment
        key={`page:attachment:${attachment._id}`}
        attachment={attachment}
        inUse={inUse[attachment._id] || false}
        onAttachmentDeleteClicked={onAttachmentDeleteClicked}
        isUserLoggedIn={isUserLoggedIn}
      />
    );
  });

  return (
    <div>
      <ul className="pl-2">
        {attachmentList}
      </ul>
    </div>
  );

};
