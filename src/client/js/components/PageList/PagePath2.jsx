import React from 'react';
import PropTypes from 'prop-types';

// import escapeStringRegexp from 'escape-string-regexp';

import PagePathModel from '../../models/PagePath';

const PagePath2 = (props) => {

  const model = new PagePathModel(props.page.path, true);

  // const pagePath = decodeURIComponent(page.path);
  // const shortPath = this.getShortPath(pagePath);

  // const shortPathEscaped = escapeStringRegexp(shortPath);
  // const pathPrefix = pagePath.replace(new RegExp(`${shortPathEscaped}(/)?$`), '');

  let classNames = ['page-path'];
  classNames = classNames.concat(props.additionalClassNames);

  // if (isShortPathOnly) {
  //   return <span className={classNames.join(' ')}>{shortPath}</span>;
  // }

  // return <span className={classNames.join(' ')}>{pathPrefix}<strong>{shortPath}</strong></span>;

  return <span className={classNames.join(' ')}>{model.former} /// {model.latter}</span>;
};

PagePath2.propTypes = {
  page: PropTypes.object.isRequired,
  isShortPathOnly: PropTypes.bool,
  additionalClassNames: PropTypes.array,
};

PagePath2.defaultProps = {
  additionalClassNames: [],
};

export default PagePath2;
