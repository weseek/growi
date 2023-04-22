import React, { useMemo } from 'react';

import { useSWRxRefs } from '../stores/refs';

import { AttachmentList } from './AttachmentList';
import { RefsContext } from './util/refs-context';


type Props = {
  prefix: string,
  pagePath: string,
  depth: string,
  regexp: string,
  isImmutable?: boolean,
};

const RefsSubstance = React.memo(({
  prefix,
  pagePath,
  depth,
  regexp,

  isImmutable,
}: Props): JSX.Element => {
  const refsContext = useMemo(() => {
    const options = {
      prefix, pagePath, depth, regexp,
    };
    return new RefsContext('refs', options);
  }, [prefix, pagePath, depth, regexp]);

  const { data, error, isLoading } = useSWRxRefs(prefix, pagePath, { depth, regexp }, isImmutable);
  const attachments = data != null ? data : [];

  return <AttachmentList
    refsContext={refsContext}
    isLoading={isLoading}
    error={error}
    attachments={attachments}
  />;
});

export const Refs = React.memo((props: Props): JSX.Element => {
  return <RefsSubstance {...props} />;
});

export const RefsImmutable = React.memo((props: Omit<Props, 'isImmutable'>): JSX.Element => {
  return <RefsSubstance {...props} isImmutable />;
});

Refs.displayName = 'Refs';
