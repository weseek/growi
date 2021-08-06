import React, {
  useState, useCallback, useEffect,
} from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
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

  const { appContainer } = props;
  const { apiGet } = appContainer;

  const [isMounted, setMounted] = useState(false);
  const [markdown, setMarkdown] = useState();

  const growiRenderer = appContainer.getRenderer('sidebar');

  // TODO: refactor with SWR
  const fetchDataAndRenderHtml = useCallback(async() => {
    let page = null;
    try {
      const result = await apiGet('/pages.get', { path: '/Sidebar' });
      page = result.page;
    }
    catch (e) {
      logger.warn(e.message);
      return;
    }
    finally {
      setMounted(true);
    }

    setMarkdown(page.revision.body);
  }, [apiGet]);

  useEffect(() => {
    fetchDataAndRenderHtml();
  }, [fetchDataAndRenderHtml]);

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">
          Custom Sidebar
          <a className="h6 ml-2" href="/Sidebar"><i className="icon-pencil"></i></a>
        </h3>
        <button type="button" className="btn btn-sm btn-outline-secondary ml-auto" onClick={fetchDataAndRenderHtml}>
          <i className="icon icon-reload"></i>
        </button>
      </div>
      { isMounted && markdown == null && <SidebarNotFound /> }
      {/* eslint-disable-next-line react/no-danger */}
      { markdown != null && (
        <div className="p-3">
          <RevisionRenderer
            growiRenderer={growiRenderer}
            markdown={markdown}
            additionalClassName="grw-custom-sidebar-content"
          />
        </div>
      ) }
    </>
  );

};

CustomSidebar.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const CustomSidebarWrapper = withUnstatedContainers(CustomSidebar, [AppContainer]);

export default CustomSidebarWrapper;
