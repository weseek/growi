import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage } from '@commons/util/path-utils';
import DevidedPagePath from '@commons/models/devided-page-path';
import LinkedPagePath from '@commons/models/linked-page-path';
import PagePathHierarchicalLink from '@commons/components/PagePathHierarchicalLink';

import CopyDropdown from './CopyDropdown';

const RevisionPath = (props) => {
  // define styles
  const buttonStyle = {
    marginLeft: '0.5em',
    padding: '0 2px',
  };

  const {
    pagePath, pageId, isPageForbidden,
  } = props;

  const dPagePath = new DevidedPagePath(pagePath, false, true);
  const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
  const isInTrash = isTrashPage(pagePath);

  return (
    <>
      <span className="d-flex align-items-center flex-wrap">
        <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.isRoot ? undefined : dPagePath.former} />
        <CopyDropdown pagePath={props.pagePath} pageId={pageId} buttonStyle={buttonStyle} />
        { !isInTrash && !isPageForbidden && (
          <a href="#edit" className="d-block d-edit-none text-muted btn btn-secondary bg-transparent btn-edit border-0" style={buttonStyle}>
            <i className="icon-note" />
          </a>
        ) }
      </span>
    </>
  );
};

RevisionPath.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  isPageForbidden: PropTypes.bool,
};

RevisionPath.defaultProps = {
  isPageForbidden: false,
};

export default withTranslation()(RevisionPath);
