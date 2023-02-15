import React from 'react';

import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from './PageHistory/PageRevisionTable';

const logger = loggerFactory('growi:PageHistory');

type PageHistoryProps = {
  sourceRevisionId?: string,
  targetRevisionId?: string
  onClose: () => void
}
export const PageHistory: React.FC<PageHistoryProps> = (props: PageHistoryProps) => {
  const { sourceRevisionId, targetRevisionId, onClose } = props;
  return (
    <div className="revision-history" data-testid="page-history">
      <PageRevisionTable
        sourceRevisionId={sourceRevisionId}
        targetRevisionId={targetRevisionId}
        onClose={onClose}
      />
    </div>
  );
};
