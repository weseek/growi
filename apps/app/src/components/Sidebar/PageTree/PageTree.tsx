import { Suspense, useState } from 'react';

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

  const [isWipPageShown, setIsWipPageShown] = useState(true);

  return (
    // TODO : #139425 Match the space specification method to others
    // ref.  https://redmine.weseek.co.jp/issues/139425
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">{t('Page Tree')}</h3>
        <Suspense>
          <PageTreeHeader
            isWipPageShown={isWipPageShown}
            onClickWipPageVisibilitySwitch={() => { setIsWipPageShown(!isWipPageShown) }}
          />
        </Suspense>
      </div>

      <Suspense fallback={<ItemsTreeContentSkeleton />}>
        <PageTreeContent isWipPageShown={isWipPageShown} />
      </Suspense>
    </div>
  );
};
