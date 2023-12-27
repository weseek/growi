import { Suspense } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { useSWRxPageByPath } from '~/stores/page';

import { SidebarHeaderReloadButton } from '../SidebarHeaderReloadButton';
import DefaultContentSkeleton from '../Skeleton/DefaultContentSkeleton';


const CustomSidebarContent = dynamic(() => import('./CustomSidebarSubstance').then(mod => mod.CustomSidebarSubstance), { ssr: false });

export const CustomSidebar = (): JSX.Element => {
  const { t } = useTranslation();

  const { mutate, isLoading } = useSWRxPageByPath('/Sidebar');

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">
          {t('CustomSidebar')}
          { !isLoading && <Link href="/Sidebar#edit" className="h6 ms-2"><i className="icon-pencil"></i></Link> }
        </h3>
        { !isLoading && <SidebarHeaderReloadButton onClick={() => mutate()} /> }
      </div>

      <Suspense fallback={<DefaultContentSkeleton />}>
        <CustomSidebarContent />
      </Suspense>
    </div>
  );
};