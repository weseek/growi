import React from 'react';
import PropTypes from 'prop-types';

import { DevidedPagePath } from '@growi/core';

export const PagePathLabel = (props) => {
  const highlightedPath = props.page.elasticSearchResult.highlightedPath;
  const dPagePath = new DevidedPagePath(highlightedPath, false, false);

  let classNames = [''];
  classNames = classNames.concat(props.additionalClassNames);

  const displayPath = (reactElement) => {
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{ __html: reactElement.props.children }}></span>;
  };

  if (props.isLatterOnly) {
    return displayPath(<>{dPagePath.latter}</>);
  }

  if (props.isFormerOnly) {
    const textElem = dPagePath.isFormerRoot
      ? <></>
      : <>{dPagePath.former}</>;
    return displayPath(textElem);
  }

  const textElem = dPagePath.isRoot
    ? <><strong>/</strong></>
    : <>{dPagePath.former}/<strong>{dPagePath.latter}</strong></>;

  return displayPath(textElem);
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
