import React from 'react';

import loggerFactory from '~/utils/logger';

import { PageRevisionTable } from './PageHistory/PageRevisionTable';

const logger = loggerFactory('growi:PageHistory');

export const PageHistory: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="revision-history" data-testid="page-history">
      <PageRevisionTable
        onClose={onClose}
      />
    </div>
  );
};
