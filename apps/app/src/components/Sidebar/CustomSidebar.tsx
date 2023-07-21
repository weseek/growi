import React, { FC } from 'react';

import type { IRevision } from '@growi/core';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { useSWRxPageByPath } from '~/stores/page';
import { useCustomSidebarOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from '../Page/RevisionRenderer';

import { SidebarHeaderReloadButton } from './SidebarHeaderReloadButton';
import CustomSidebarContentSkeleton from './Skeleton/CustomSidebarContentSkeleton';

import styles from './CustomSidebar.module.scss';


const logger = loggerFactory('growi:cli:CustomSidebar');


const SidebarNotFound = () => {
  return (
    <div className="grw-sidebar-content-header h5 text-center py-3">
      <Link href="/Sidebar#edit">
        <i className="icon-magic-wand"></i>Create<strong>/Sidebar</strong>page
      </Link>
    </div>
  );
};

const CustomSidebar: FC = () => {
  const { t } = useTranslation();
  const { data: rendererOptions } = useCustomSidebarOptions();

  const { data: page, error, mutate } = useSWRxPageByPath('/Sidebar');

  if (rendererOptions == null) {
    return <></>;
  }

  const isLoading = page === undefined && error == null;
  const markdown = (page?.revision as IRevision | undefined)?.body;

  return (
    <div className="px-3">
      <div className="grw-sidebar-content-header py-3 d-flex">
        <h3 className="mb-0">
          {t('CustomSidebar')}
          <Link href="/Sidebar#edit" className="h6 ml-2"><i className="icon-pencil"></i></Link>
        </h3>
        <SidebarHeaderReloadButton onClick={() => mutate()} />
      </div>

      {
        isLoading && (
          <CustomSidebarContentSkeleton />
        )
      }

      {
        (!isLoading && markdown != null) && (
          <div className={`py-3 grw-custom-sidebar-content ${styles['grw-custom-sidebar-content']}`}>
            <RevisionRenderer
              rendererOptions={rendererOptions}
              markdown={markdown}
            />
          </div>
        )
      }

      {
        (!isLoading && markdown === undefined) && (
          <SidebarNotFound />
        )
      }
    </div>
  );
};

export default CustomSidebar;
