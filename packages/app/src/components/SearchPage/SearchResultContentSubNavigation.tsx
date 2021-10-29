import React, { FC } from 'react';
import LinkedPagePath from '../../models/linked-page-path';
import PagePathHierarchicalLink from '../PagePathHierarchicalLink';
import CopyDropdown from '../Page/CopyDropdown';
import SubNavButton from '../Navbar/SubNavButtons';

const { DevidedPagePath } = require('@growi/core');


// TODO : change SubNavButtons in a way that they can be used not depending on pageContainer.
// note: SubNavButtons contains PageManagement and PageReactionsButtons. PageManagement has muliple modals...


type PagePathNavProps = {
  pageId: string,
  pagePath: string,
  isCompactMode: boolean,
}
const PagePathNav: FC<PagePathNavProps> = (props:PagePathNavProps) => {
  const { pageId, pagePath, isCompactMode } = props;
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

type SearchResultContentSubNavigationProps = {
  pageId: string,
  pagePath: string,
  isCompactMode: boolean,
}
const SearchResultContentSubNavigation: FC<SearchResultContentSubNavigationProps> = (props:SearchResultContentSubNavigationProps) => {
  const SubNavButtonsTypeAny : any = SubNavButton;
  return (
    <div className="grw-subnav container-fluid d-flex align-items-center justify-content-between grw-subnav-compact d-print-none">
      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        <div className="grw-path-nav-container">
          {/* tags info */}
          <PagePathNav pageId={props.pageId} pagePath={props.pagePath} isCompactMode />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">
        <div className="d-flex flex-column align-items-end">
          <div className="d-flex">
            <SubNavButtonsTypeAny isSearchPageMode></SubNavButtonsTypeAny>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultContentSubNavigation;
