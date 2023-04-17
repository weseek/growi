import React from 'react';

import { useCurrentPagePath, useCurrentPageId } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from './PageHistory/PageRevisionTable';

const logger = loggerFactory('growi:PageHistory');

type PageHistoryProps = {
  sourceRevisionId?: string,
  targetRevisionId?: string
  onClose: () => void
}

// Get string from 'compare' query params
export const getQueryParam = (): string | null => {
  const query: URLSearchParams = new URL(window.location.href).searchParams;
  return query.get('compare');
};

export const PageHistory: React.FC<PageHistoryProps> = (props: PageHistoryProps) => {
  const { sourceRevisionId, targetRevisionId, onClose } = props;

  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();

  return (
    <div className="revision-history" data-testid="page-history">
      {currentPageId != null && currentPagePath != null && (
        <PageRevisionTable
          sourceRevisionId={sourceRevisionId}
          targetRevisionId={targetRevisionId}
          currentPageId={currentPageId}
          currentPagePath={currentPagePath}
          onClose={onClose}
        />
      )}
    </div>
  );
};
