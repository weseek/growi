import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { DevidedPagePath } from '@growi/core';
import LinkedPagePath from '~/models/linked-page-path';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import SubnavButtons from '../Navbar/SubNavButtons';


import CopyDropdown from '../Page/CopyDropdown';

// TODO : to tsx
const PagePathNav = ({
  // eslint-disable-next-line react/prop-types
  pageId, pagePath, isCompactMode,
}) => {
  const dPagePath = new DevidedPagePath(pagePath, false, true);

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} />;
  }

  const copyDropdownId = `copydropdown${isCompactMode ? '-subnav-compact' : ''}-${pageId}`;
  const copyDropdownToggleClassName = 'd-block text-muted bg-transparent btn-copy border-0 py-0';

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <span className="d-flex align-items-center">
        <h1 className="m-0">{latterLink}</h1>
        <div className="mx-2">
          <CopyDropdown
            pageId={pageId}
            pagePath={pagePath}
            dropdownToggleId={copyDropdownId}
            dropdownToggleClassName={copyDropdownToggleClassName}
          >
            <i className="ti-clipboard"></i>
          </CopyDropdown>
        </div>
      </span>
    </div>
  );
};

const SearchResultContentSubNavigation = (props) => {
  // const { pageContaine } = props;
  // return <PagePathNav pageId={props.pageId} pagePath={props.pagePath} isCompactMode></PagePathNav>;
  return (
    <div className="grw-subnav container-fluid d-flex align-items-center justify-content-between grw-subnav-compact d-print-none">
      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        <div className="grw-path-nav-container">
          {/* {pageContainer.isAbleToShowTagLabel && !isCompactMode && !isTagLabelHidden && (
            <div className="grw-taglabels-container">
              <TagLabels editorMode={editorMode} />
            </div>
          )} */}
          <PagePathNav pageId={props.pageId} pagePath={props.pagePath} isCompactMode />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">
        <div className="d-flex flex-column align-items-end">
          <div className="d-flex">
            <SubnavButtons isCompactMode />
          </div>
        </div>
      </div>
    </div>
  );
};
SearchResultContentSubNavigation.propTypes = {
  pageId: PropTypes.node,
  pagePath: PropTypes.node,
};
export default SearchResultContentSubNavigation;
