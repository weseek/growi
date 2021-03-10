import loggerFactory from '~/utils/logger';
import { useCustomSidebarRenderer } from '~/stores/renderer';
import { usePageSWR } from '~/stores/page';

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

const CustomSidebar = (props) => {

  const renderer = useCustomSidebarRenderer();

  const { data: page, isValidating, mutate } = usePageSWR('/Sidebar');

  const markdown = page?.revision?.body;

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">
          Custom Sidebar
          <a className="h6 ml-2" href="/Sidebar"><i className="icon-pencil"></i></a>
        </h3>
        <button type="button" className="btn btn-sm btn-outline-secondary ml-auto" onClick={() => mutate()}>
          <i className="icon icon-reload"></i>
        </button>
      </div>
      { !isValidating && markdown == null && <SidebarNotFound /> }
      {/* eslint-disable-next-line react/no-danger */}
      { markdown != null && (
        <div className="p-3">
          <RevisionRenderer
            renderer={renderer}
            markdown={markdown}
            additionalClassName="grw-custom-sidebar-content"
          />
        </div>
      ) }
    </>
  );

};

export default CustomSidebar;
