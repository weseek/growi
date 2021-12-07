import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSWRxV5MigrationStatus } from '~/stores/page-listing';
import { useCurrentPagePath, usePageId, useTargetAndAncestors } from '~/stores/context';

import ItemsTree from './PageTree/ItemsTree';
import PrivateLegacyPages from './PageTree/PrivateLegacyPages';


const PageTree: FC = memo(() => {
  const { t } = useTranslation();

  const { data: currentPath } = useCurrentPagePath();
  const { data: targetId } = usePageId();
  const { data: targetAndAncestorsData } = useTargetAndAncestors();

  const { data: migrationStatus } = useSWRxV5MigrationStatus();

  const path = currentPath || '/';

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Page Tree')}</h3>
      </div>

      <div className="grw-sidebar-content-body">
        <ItemsTree targetPath={path} targetId={targetId} targetAndAncestorsData={targetAndAncestorsData} />
      </div>

      <div className="grw-sidebar-content-footer">
        {
          migrationStatus?.migratablePagesCount != null && migrationStatus.migratablePagesCount !== 0 && (
            <PrivateLegacyPages />
          )
        }
      </div>
    </>
  );
});

export default PageTree;
