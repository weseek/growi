import React from 'react';
import PropTypes from 'prop-types';

import PagePathLabel from './PagePathLabel';

/**
 * !!DEPRECATED!!
 *
 * maintained for backward compatibility for growi-lsx-plugin(<= 3.1.1)
 */
const PagePath = props => (
  <PagePathLabel isLatterOnly={props.isShortPathOnly} {...props} />
);

PagePath.propTypes = {
  isShortPathOnly: PropTypes.bool,
  ...PagePathLabel.propTypes,
};

PagePath.defaultProps = {
  ...PagePathLabel.defaultProps,
};

export default PagePath;
