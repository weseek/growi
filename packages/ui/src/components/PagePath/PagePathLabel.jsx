import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { DevidedPagePath } from '@growi/core';


const TextElement = props => (
  <>
    { props.isHTML
      ? <span dangerouslySetInnerHTML={{ __html: props.children }}></span>
      : <>{props.children}</>
    }
  </>
);

export const PagePathLabel = (props) => {
  const {
    isLatterOnly, isFormerOnly, isPathIncludedHtml, additionalClassNames, path,
  } = props;

  const dPagePath = new DevidedPagePath(path, false, true);

  const classNames = ['']
    .concat(additionalClassNames);

  let textElem;

  if (props.isLatterOnly) {
    textElem = <TextElement isHTML={isPathIncludedHtml}>{dPagePath.latter}</TextElement>;
  }
  else if (props.isFormerOnly) {
    textElem = dPagePath.isFormerRoot
      ? <>/</>
      : <TextElement isHTML={isPathIncludedHtml}>{dPagePath.former}</TextElement>;
  }
  else {
    textElem = dPagePath.isRoot
      ? <strong>/</strong>
      : <TextElement isHTML={isPathIncludedHtml}>{dPagePath.former}/<strong>{dPagePath.latter}</strong></TextElement>;
  }

  return <span className={classNames.join(' ')}>{textElem}</span>;
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
