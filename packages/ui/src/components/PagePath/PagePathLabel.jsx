import React from 'react';
import PropTypes from 'prop-types';

import { DevidedPagePath } from '@growi/core';

export const PagePathLabel = (props) => {
  const dPagePath = new DevidedPagePath(props.path, false, true);

  let classNames = [''];
  classNames = classNames.concat(props.additionalClassNames);

  const displayPath = (reactElement) => {
    if (props.isPathIncludedHtml) {
      // eslint-disable-next-line react/no-danger
      return <span dangerouslySetInnerHTML={{ __html: reactElement.props.children }}></span>;
    }
    return <span className={classNames.join(' ')}>{reactElement.props.children}</span>;
  };


  if (props.isLatterOnly) {
    return displayPath(<>{dPagePath.latter}</>);
  }

  if (props.isFormerOnly) {
    const textElem = dPagePath.isFormerRoot
      ? <>/</>
      : <>{dPagePath.former}</>;
    return displayPath(textElem);
  }

  const textElem = dPagePath.isRoot
    ? <><strong>/</strong></>
    : <>{dPagePath.former}/<strong>{dPagePath.latter}</strong></>;

  return displayPath(textElem);
};

PagePathLabel.propTypes = {
  isLatterOnly: PropTypes.bool,
  isFormerOnly: PropTypes.bool,
  isPathIncludedHtml: PropTypes.bool,
  additionalClassNames: PropTypes.arrayOf(PropTypes.string),
  path: PropTypes.string.isRequired,
};

PagePathLabel.defaultProps = {
  additionalClassNames: [],
};
