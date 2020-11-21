import React from 'react';
import PropTypes from 'prop-types';

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
  pagePath: PropTypes.string.isRequired,
  pageId: PropTypes.string,
};

export default RevisionPathControls;
