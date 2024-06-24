import React from 'react';

import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from '../PageHistory/PageRevisionTable';

import { useAutoComparingRevisionsByQueryParam } from './hooks';

const logger = loggerFactory('growi:PageHistory');

type PageHistoryProps = {
  onClose: () => void
}

export const PageHistory: React.FC<PageHistoryProps> = (props: PageHistoryProps) => {
  const { onClose } = props;

  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();

  const comparingRevisions = useAutoComparingRevisionsByQueryParam();

  return (
    <div className="revision-history" data-testid="page-history">
      {currentPageId != null && currentPagePath != null && (
        <PageRevisionTable
          sourceRevisionId={comparingRevisions?.sourceRevisionId}
          targetRevisionId={comparingRevisions?.targetRevisionId}
          currentPageId={currentPageId}
          currentPagePath={currentPagePath}
          onClose={onClose}
        />
      )}
    </div>
  );
};
