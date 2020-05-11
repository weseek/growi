import React from 'react';
import PropTypes from 'prop-types';

import urljoin from 'url-join';

import LinkedPagePath from '../models/linked-page-path';


const PagePathHierarchicalLink = (props) => {
  const { linkedPagePath, basePath } = props;

  // render root element
  if (linkedPagePath.isRoot) {
    if (basePath != null) {
      return null;
    }

    return props.isPageInTrash
      ? (
        <>
          <span className="path-segment">
            <a href="/trash"><i className="icon-trash"></i></a>
          </span>
          <span className="separator"><a href="/">/</a></span>
        </>
      )
      : (
        <>
          <span className="path-segment">
            <a href="/">
              <i className="icon-home"></i>
              <span className="separator">/</span>
            </a>
          </span>
        </>
      );
  }

  const isParentExists = linkedPagePath.parent != null;
  const isParentRoot = isParentExists && linkedPagePath.parent.isRoot;
  const isSeparatorRequired = isParentExists && !isParentRoot;

  const href = encodeURI(urljoin(basePath || '', linkedPagePath.href));

  return (
    <>
      { isParentExists && (
        <PagePathHierarchicalLink linkedPagePath={linkedPagePath.parent} basePath={basePath} />
      ) }
      { isSeparatorRequired && (
        <span className="separator">/</span>
      ) }

      <a className="page-segment" href={href}>{linkedPagePath.pathName}</a>
    </>
  );
};

PagePathHierarchicalLink.propTypes = {
  linkedPagePath: PropTypes.instanceOf(LinkedPagePath).isRequired,
  basePath: PropTypes.string,

  isPageInTrash: PropTypes.bool, // TODO: omit
};

export default PagePathHierarchicalLink;
