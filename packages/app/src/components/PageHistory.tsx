import React from 'react';

import { useCurrentPageId } from '~/stores/context';
import { useCurrentPagePath } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from './PageHistory/PageRevisionTable';

const logger = loggerFactory('growi:PageHistory');

export const PageHistory: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { data: currentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  return (
    <div className="revision-history" data-testid="page-history">
      { currentPageId && currentPagePath && (
        <PageRevisionTable
          currentPageId={currentPageId}
          currentPagePath = {currentPagePath}
          onClose={onClose}
        />
      )}
    </div>
  );
};
