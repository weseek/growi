import React, { useMemo } from 'react';

import { useSWRxRef } from '../stores/refs';

import { AttachmentList } from './AttachmentList';
import { RefsContext } from './util/refs-context';


type Props = {
  fileNameOrId: string,
  pagePath: string,
  isImmutable?: boolean,
};

const RefImgSubstance = React.memo(({
  fileNameOrId,
  pagePath,
  isImmutable,
}: Props): JSX.Element => {
  const refsContext = useMemo(() => {
    const options = {
      fileNameOrId, pagePath,
    };
    return new RefsContext('refimg', options);
  }, [fileNameOrId, pagePath]);

  const { data, error, isLoading } = useSWRxRef(pagePath, fileNameOrId, isImmutable);
  const attachments = data != null ? [data] : [];

  return <AttachmentList
    refsContext={refsContext}
    isLoading={isLoading}
    error={error}
    attachments={attachments}
    isExtractImg
  />;
});

export const RefImg = React.memo((props: Props): JSX.Element => {
  return <RefImgSubstance {...props} />;
});

export const RefImgImmutable = React.memo((props: Omit<Props, 'isImmutable'>): JSX.Element => {
  return <RefImgSubstance {...props} isImmutable />;
});

RefImg.displayName = 'RefImg';
