import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

import RevisionPathControls from '../Page/RevisionPathControls';
import TagLabels from '../Page/TagLabels';

const PagePathNavForEditor = (props) => {
  const { pageId, path } = props.pageContainer.state;

  const linkedPagePath = new LinkedPagePath(path);
  const pagePathHierarchicalLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;

  return (
    <div className="grw-page-path-nav-for-edit">
      <span className="d-flex align-items-center flex-wrap">
        <h3 className="mb-0 grw-page-path-link">{pagePathHierarchicalLink}</h3>
        <RevisionPathControls
          pageId={pageId}
          pagePath={path}
        />
      </span>
      <TagLabels isEditorMode />
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const PagePathNavForEditorWrapper = withUnstatedContainers(PagePathNavForEditor, [AppContainer, PageContainer]);


PagePathNavForEditor.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PagePathNavForEditorWrapper);
