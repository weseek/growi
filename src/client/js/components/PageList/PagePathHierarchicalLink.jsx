import React from 'react';
import PropTypes from 'prop-types';

import LinkedPagePath from '../../models/LinkedPagePath';


const PagePathHierarchicalLink = (props) => {
  const { linkedPagePath } = props;

  if (linkedPagePath.isRoot) {
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
  return (
    <>
      { isParentExists && (
        <>
          <PagePathHierarchicalLink linkedPagePath={linkedPagePath.parent} />
          { !isParentRoot && (
            <span className="separator">/</span>
          ) }
        </>
      ) }

      <a className="page-segment" href={encodeURI(linkedPagePath.href)}>{linkedPagePath.pathName}</a>
    </>
  );
};

PagePathHierarchicalLink.propTypes = {
  linkedPagePath: PropTypes.instanceOf(LinkedPagePath).isRequired,
  isPageInTrash: PropTypes.bool,
};

export default PagePathHierarchicalLink;
