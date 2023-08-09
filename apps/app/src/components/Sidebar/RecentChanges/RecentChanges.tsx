import { Suspense, useState } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import RecentChangesContentSkeleton from './RecentChangesContentSkeleton';

const RecentChangesHeader = dynamic(() => import('./RecentChangesSubstance').then(mod => mod.RecentChangesHeader), { ssr: false });
const RecentChangesContent = dynamic(
  () => import('./RecentChangesSubstance').then(mod => mod.RecentChangesContent),
  { ssr: false, loading: RecentChangesContentSkeleton },
);


export const RecentChanges = (): JSX.Element => {
  const { t } = useTranslation();

  const [isSmall, setIsSmall] = useState(false);

  return (
    <div className="px-3" data-testid="grw-recent-changes">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0 text-nowrap">{t('Recent Changes')}</h3>
        <Suspense>
          <RecentChangesHeader isSmall={isSmall} onSizeChange={setIsSmall} />
        </Suspense>
      </div>

      <Suspense fallback={<RecentChangesContentSkeleton />}>
        <RecentChangesContent isSmall={isSmall} />
      </Suspense>
    </div>
  );
};
