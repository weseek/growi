import React from 'react';
import PropTypes from 'prop-types';

import LinkedPagePath from '../../models/LinkedPagePath';


const PagePathHierarchicalLink = (props) => {
  const { linkedPagePath, additionalClassNames } = props;

  let classNames = ['page-segment'];
  classNames = classNames.concat(additionalClassNames);

  const RootLink = () => {
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
  };

  const isParentExists = linkedPagePath.parent != null;
  const isParentRoot = isParentExists && linkedPagePath.parent.parent == null;
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
      { !isParentExists && <RootLink /> }

      <a classNames={classNames} href={encodeURI(linkedPagePath.href)}>{linkedPagePath.pathName}</a>
    </>
  );
};

PagePathHierarchicalLink.propTypes = {
  linkedPagePath: PropTypes.instanceOf(LinkedPagePath).isRequired,
  additionalClassNames: PropTypes.array,

  isPageInTrash: PropTypes.bool,
};

PagePathHierarchicalLink.defaultProps = {
  additionalClassNames: [],
};

export default PagePathHierarchicalLink;
