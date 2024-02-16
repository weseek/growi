import { Suspense } from 'react';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

import ItemsTreeContentSkeleton from '../../ItemsTree/ItemsTreeContentSkeleton';

import { PageTreeHeader } from './PageTreeSubstance';

const PageTreeContent = dynamic(
  () => import('./PageTreeSubstance').then(mod => mod.PageTreeContent),
  { ssr: false, loading: ItemsTreeContentSkeleton },
);


export const PageTree = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    // TODO : #140878 Match the space specification method to others
    // ref.  https://redmine.weseek.co.jp/issues/140878
    <div className="pt-4 pb-3 px-3">
      <div className="grw-sidebar-content-header d-flex">
        <h3 className="mb-0">{t('Page Tree')}</h3>
        <Suspense>
          <PageTreeHeader />
        </Suspense>
      </div>

      <Suspense fallback={<ItemsTreeContentSkeleton />}>
        <PageTreeContent />
      </Suspense>
    </div>
  );
};
