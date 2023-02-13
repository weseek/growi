import React, { useState, useEffect } from 'react';

import { IRevisionHasPageId } from '@growi/core';

import { useCurrentPageId } from '~/stores/context';
import { useCurrentPagePath, useSWRxInfinitePageRevisions } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from './PageHistory/PageRevisionTable';

const logger = loggerFactory('growi:PageHistory');

export const PageHistory: React.FC<{ onClose: () => void }> = ({ onClose }) => {

  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();

  const swrInifiniteResponse = useSWRxInfinitePageRevisions(currentPageId);
  const { data: revisionsData, mutate: mutatePageRevisions } = swrInifiniteResponse;


  const [sourceRevision, setSourceRevision] = useState<IRevisionHasPageId>();
  const [targetRevision, setTargetRevision] = useState<IRevisionHasPageId>();

  const latestRevision = revisionsData != null ? revisionsData[0][0] : null;

  useEffect(() => {
    if (latestRevision != null) {
      setSourceRevision(latestRevision);
      setTargetRevision(latestRevision);
    }
  }, [latestRevision]);

  useEffect(() => {
    mutatePageRevisions();
  });


  if (revisionsData == null || sourceRevision == null || targetRevision == null || currentPageId == null || currentPagePath == null) {
    return (
      <div className="text-muted text-center">
        <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
      </div>
    );
  }

  return (
    <div className="revision-history" data-testid="page-history">
      <PageRevisionTable
        onClose={onClose}
      />
    </div>
  );
};
