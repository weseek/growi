import { Suspense } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import PageTreeContentSkeleton from './PageTreeContentSkeleton';
import { PageTreeHeader } from './PageTreeSubstance';

const PageTreeContent = dynamic(
  () => import('./PageTreeSubstance').then(mod => mod.PageTreeContent),
  { ssr: false, loading: PageTreeContentSkeleton },
);


export const PageTree = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">{t('Page Tree')}</h3>
        <Suspense>
          <PageTreeHeader />
        </Suspense>
      </div>

      <Suspense fallback={<PageTreeContentSkeleton />}>
        <PageTreeContent />
      </Suspense>
    </div>
  );
};
