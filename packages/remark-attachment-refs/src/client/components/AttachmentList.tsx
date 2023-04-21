import { IAttachmentHasId } from '@growi/core';
import { Attachment } from '@growi/ui/dist/components/Attachment';

import { ExtractedAttachments } from './ExtractedAttachments';
import { RefsContext } from './util/refs-context';


import styles from './AttachmentList.module.scss';

const AttachmentLink = Attachment;

type Props = {
  refsContext: RefsContext
  isLoading: boolean
  error?: Error
  attachments: IAttachmentHasId[]
};

export const AttachmentList = ({
  refsContext,
  isLoading,
  error,
  attachments,
}: Props): JSX.Element => {
  const renderNoAttachmentsMessage = () => {
    let message;

    if (refsContext.options?.prefix != null) {
      message = `${refsContext.options.prefix} and descendant pages have no attachments`;
    }
    else {
      message = `${refsContext.options?.pagePath} has no attachments`;
    }

    return (
      <div className="text-muted">
        <small>
          <i className="fa fa-fw fa-info-circle" aria-hidden="true"></i>
          {message}
        </small>
      </div>
    );
  };

  const renderContents = () => {
    if (isLoading) {
      return (
        <div className="text-muted">
          <i className="fa fa-spinner fa-pulse mr-1"></i>
          <span className="attachment-refs-blink">{refsContext.toString()}</span>
        </div>
      );
    }
    if (error != null) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {refsContext.toString()} (-&gt; <small>{error.message}</small>)
        </div>
      );
    }

    // no attachments
    if (attachments.length === 0) {
      return renderNoAttachmentsMessage();
    }

    return (refsContext.isExtractImage)
      ? <ExtractedAttachments attachments={attachments} refsContext={refsContext} />
      : attachments.map((attachment) => {
        return <AttachmentLink key={attachment._id} attachment={attachment} inUse={false} />;
      });
  };

  return <div className={styles['attachment-refs']}>{renderContents()}</div>;

};
