import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { useSWRxPageByPath } from '~/stores/page';
import { useCustomSidebarOptions } from '~/stores/renderer';

import { SidebarHeaderReloadButton } from '../SidebarHeaderReloadButton';
import DefaultContentSkeleton from '../Skeleton/DefaultContentSkeleton';

import { SidebarNotFound } from './CustomSidebarNotFound';


const CustomSidebarSubstance = dynamic(
  () => import('./CustomSidebarSubstance').then(mod => mod.CustomSidebarSubstance),
  { ssr: false, loading: DefaultContentSkeleton },
);

export const CustomSidebar = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: rendererOptions, isLoading: isLoadingRendererOptions } = useCustomSidebarOptions();
  const { data: page, mutate, isLoading: isLoadingPage } = useSWRxPageByPath('/Sidebar');

  const isLoading = isLoadingPage || isLoadingRendererOptions;

  const markdown = page?.revision.body;

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">
          {t('CustomSidebar')}
          { !isLoading && <Link href="/Sidebar#edit" className="h6 ml-2"><i className="icon-pencil"></i></Link> }
        </h3>
        { !isLoading && <SidebarHeaderReloadButton onClick={() => mutate()} /> }
      </div>

      { isLoading
        ? <DefaultContentSkeleton />
        : (
          <>
            { rendererOptions != null && markdown != null && (
              <CustomSidebarSubstance markdown={markdown} rendererOptions={rendererOptions} />
            ) }
            { markdown === undefined && (
              <SidebarNotFound />
            ) }
          </>
        )
      }
    </div>
  );
};
