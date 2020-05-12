import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { isTrashPage } from '@commons/util/path-utils';

import CopyDropdown from './CopyDropdown';

const RevisionPathControls = (props) => {
  // define styles
  const buttonStyle = {
    marginLeft: '0.5em',
    padding: '0 2px',
  };

  const {
    pagePath, pageId, isPageForbidden,
  } = props;

  const isPageInTrash = isTrashPage(pagePath);

  return (
    <>
      <CopyDropdown pagePath={pagePath} pageId={pageId} buttonStyle={buttonStyle} />
      { !isPageInTrash && !isPageForbidden && (
        <a href="#edit" className="d-edit-none text-muted btn btn-secondary bg-transparent btn-edit border-0" style={buttonStyle}>
          <i className="icon-note" />
        </a>
      ) }
    </>
  );
};

RevisionPathControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  isPageForbidden: PropTypes.bool,
};

RevisionPathControls.defaultProps = {
  isPageForbidden: false,
};

export default withTranslation()(RevisionPathControls);
