import React from 'react';
import PropTypes from 'prop-types';

import DevidedPagePath from '@commons/models/devided-page-path';

const PagePathLabel = (props) => {

  const dPagePath = new DevidedPagePath(props.page.path, false, true);

  let classNames = ['page-path'];
  classNames = classNames.concat(props.additionalClassNames);

  if (props.isLatterOnly) {
    return <span className={classNames.join(' ')}>{dPagePath.latter}</span>;
  }

  const textElem = (dPagePath.former == null && dPagePath.latter == null)
    ? <><strong>/</strong></>
    : <>{dPagePath.former}/<strong>{dPagePath.latter}</strong></>;

  return <span className={classNames.join(' ')}>{textElem}</span>;
};

PagePathLabel.propTypes = {
  page: PropTypes.object.isRequired,
  isLatterOnly: PropTypes.bool,
  additionalClassNames: PropTypes.array,
};

PagePathLabel.defaultProps = {
  additionalClassNames: [],
};

export default PagePathLabel;
