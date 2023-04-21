import { useMemo } from 'react';

import { useSWRxRef } from '../stores/refs';

import { AttachmentList } from './AttachmentList';
import { RefsContext } from './util/refs-context';


type Props = {
  fileNameOrId: string,
  pagePath: string,
  isImmutable?: boolean,
};

export const Ref = ({
  fileNameOrId,
  pagePath,
  isImmutable,
}: Props): JSX.Element => {
  const refsContext = useMemo(() => {
    const options = {
      fileNameOrId, pagePath,
    };
    return new RefsContext('ref', options);
  }, [fileNameOrId, pagePath]);

  const { data, error, isLoading } = useSWRxRef(pagePath, fileNameOrId, isImmutable);
  const attachments = data != null ? [data] : [];

  return <AttachmentList
    refsContext={refsContext}
    isLoading={isLoading}
    error={error}
    attachments={attachments}
  />;
};
