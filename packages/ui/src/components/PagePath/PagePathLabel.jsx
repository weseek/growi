import React from 'react';
import PropTypes from 'prop-types';

import { DevidedPagePath } from '@growi/core';

export const PagePathLabel = (props) => {

  const dPagePath = new DevidedPagePath(props.page.path, false, true);
  console.log(props.page.path);

  let classNames = [''];
  classNames = classNames.concat(props.additionalClassNames);

  if (props.isLatterOnly) {
    return <span className={classNames.join(' ')}>{dPagePath.latter}</span>;
  }

  if (props.isFormerOnly) {
    const textElem = dPagePath.isFormerRoot
      ? <>/</>
      : <>{dPagePath.former}</>;
    return <span className={classNames.join(' ')}>{textElem}</span>;
  }

  const textElem = dPagePath.isRoot
    ? <><strong>/</strong></>
    : <>{dPagePath.former}/<strong>{dPagePath.latter}</strong></>;

  return <span className={classNames.join(' ')}>{textElem}</span>;
};

PagePathLabel.propTypes = {
  page: PropTypes.object.isRequired,
  isLatterOnly: PropTypes.bool,
  isFormerOnly: PropTypes.bool,
  additionalClassNames: PropTypes.arrayOf(PropTypes.string),
};

PagePathLabel.defaultProps = {
  additionalClassNames: [],
};
