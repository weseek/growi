import React, { FC } from 'react';

import AppContainer from '~/client/services/AppContainer';
import { IRevision } from '~/interfaces/revision';
import { useSWRxPageByPath } from '~/stores/page';
import { useCustomSidebarRenderer } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from '../Page/RevisionRenderer';

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

type Props = {
  appContainer: AppContainer,
};

const CustomSidebar: FC<Props> = () => {

  const { data: renderer } = useCustomSidebarRenderer();

  const { data: page, error, mutate } = useSWRxPageByPath('/Sidebar');

  if (renderer == null) {
    return <></>;
  }

  const isLoading = page === undefined && error == null;
  const markdown = (page?.revision as IRevision | undefined)?.body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RevisionRendererAny: any = RevisionRenderer;

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">
          Custom Sidebar
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
          <div className="p-3">
            <RevisionRendererAny
              growiRenderer={renderer}
              markdown={markdown}
              pagePath="/Sidebar"
              additionalClassName="grw-custom-sidebar-content"
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
