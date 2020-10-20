import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import CopyDropdown from './CopyDropdown';

const RevisionPathControls = (props) => {
  // define styles
  const buttonStyle = {
    marginLeft: '0.5em',
    padding: '0 2px',
  };

  const {
    pagePath, pageId,
  } = props;


  return (
    <>
      <CopyDropdown pagePath={pagePath} pageId={pageId} buttonStyle={buttonStyle} />
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
