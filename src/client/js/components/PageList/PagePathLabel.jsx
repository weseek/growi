import React from 'react';
import PropTypes from 'prop-types';

import DevidedPagePath from '@commons/models/devided-page-path';

const PagePathLabel = (props) => {

  const dPagePath = new DevidedPagePath(props.page.path, false, true);

  let classNames = [''];
  classNames = classNames.concat(props.additionalClassNames);

  if (props.isLatterOnly) {
    return <span className={classNames.join(' ')}>{dPagePath.latter}</span>;
  }

  const textElem = dPagePath.isRoot
    ? <><strong>/</strong></>
    : <>{dPagePath.former}/<strong>{dPagePath.latter}</strong></>;

  return <span className={classNames.join(' ')}>{textElem}</span>;
};

PagePathLabel.propTypes = {
  page: PropTypes.object.isRequired,
  isLatterOnly: PropTypes.bool,
  additionalClassNames: PropTypes.arrayOf(PropTypes.string),
};

PagePathLabel.defaultProps = {
  additionalClassNames: [],
};

export default PagePathLabel;
