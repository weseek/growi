import { useCallback } from 'react';

import type { IAttachmentHasId } from '@growi/core';
import { Attachment } from '@growi/ui/dist/components';

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
  const renderNoAttachmentsMessage = useCallback(() => {
    return (
      <div className="text-muted">
        <small>
          <i className="fa fa-fw fa-info-circle" aria-hidden="true"></i>
          {
            refsContext.options?.prefix != null
              ? `${refsContext.options.prefix} and descendant pages have no attachments`
              : `${refsContext.pagePath} has no attachments`
          }
        </small>
      </div>
    );
  }, [refsContext]);

  const renderContents = useCallback(() => {
    if (isLoading) {
      return (
        <div className="text-muted">
          <i className="fa fa-spinner fa-pulse me-1"></i>
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
  }, [isLoading, error, attachments, refsContext, renderNoAttachmentsMessage]);

  return <div className={styles['attachment-refs']}>{renderContents()}</div>;

};
