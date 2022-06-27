import React, { useState, useEffect, useCallback } from 'react';

import * as ReactDOMServer from 'react-dom/server';

import { toastError } from '~/client/util/apiNotification';
import { apiGet } from '~/client/util/apiv1-client';

type Props = {
  attachmentId: string,
}

const PageRichAttachmentPresentation = (attachmentId: Props): JSX.Element => {
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  // TODO: add other state

  const getAttachmentData = useCallback(async() => {
    const _id = attachmentId;

    try {
      const res: any = await apiGet('/attachments.get', { id: _id });
      const attachment = res.attachment;
      setUrl(attachment.filePathProxied);
      setFileName(attachment.originalName);
      // TODO: add other set state method
    }
    catch (err) {
      // TODO: check error handling method
      toastError(err);
    }
  }, [attachmentId]);

  useEffect(() => {
    getAttachmentData();
  }, [getAttachmentData]);

  // TODO: add Download button method
  // TODO: add Trash button method

  // TODO; create Rich Attachment presentation
  return (
    <div className="mt-4 card border-primary">
      <div className="card-body">
        <a className="bg-info text-white" href={url}>{fileName}</a>
        <ul>
          {/* TODO: add attachemnt picture */}
          {/* TODO: add attachment creator picture */}
          {/* <UserPicture user={attachment.creator} size="sm"></UserPicture> */}
          {/* TODO: add Date */}
          {/* TODO: add Data byte */}
          {/* TODO: add Trash button */}
          {/* TODO: add Download button */}
        </ul>
      </div>
    </div>
  );

};

export function showRichAttachment(attachmentId: string): string {
  const Element = <PageRichAttachmentPresentation attachmentId={attachmentId} />;
  return ReactDOMServer.renderToString(Element);
}
