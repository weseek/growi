import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';

import { IRevision } from '~/interfaces/revision';
import { useSWRxPageByPath } from '~/stores/page';
import { useCustomSidebarOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from '../Page/RevisionRenderer';


import styles from './CustomSidebar.module.scss';


const logger = loggerFactory('growi:cli:CustomSidebar');


const SidebarNotFound = () => {
  return (
    <div className="grw-sidebar-content-header h5 text-center p-3">
      <a href="/Sidebar#edit">
        <i className="icon-magic-wand"></i> Create <strong>/Sidebar</strong> page
      </a>
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
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">
          {t('CustomSidebar')}
          <a className="h6 ml-2" href="/Sidebar"><i className="icon-pencil"></i></a>
        </h3>
        <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => mutate()}>
          <i className="icon icon-reload"></i>
        </button>
      </div>

      {
        isLoading && (
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        )
      }

      {
        (!isLoading && markdown != null) && (
          <div className={`p-3 grw-custom-sidebar-content ${styles['grw-custom-sidebar-content']}`}>
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
    </>
  );
};

export default CustomSidebar;
