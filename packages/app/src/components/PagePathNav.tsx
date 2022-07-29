import React, { FC } from 'react';

import { DevidedPagePath } from '@growi/core';
import dynamic from 'next/dynamic';

import { useIsEmpty } from '~/stores/context';

import LinkedPagePath from '../models/linked-page-path';

import PagePathHierarchicalLink from './PagePathHierarchicalLink';


type Props = {
  pagePath: string,
  pageId?: string | null,
  isSingleLineMode?:boolean,
  isCompactMode?:boolean,
}

const PagePathNav: FC<Props> = (props: Props) => {
  const {
    pageId, pagePath, isSingleLineMode, isCompactMode,
  } = props;
  const dPagePath = new DevidedPagePath(pagePath, false, true);

  const { data: isEmpty } = useIsEmpty();

  const CopyDropdown = dynamic(() => import('./Page/CopyDropdown'), { ssr: false });

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot || isSingleLineMode) {
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
  const copyDropdownToggleClassName = 'd-block btn-outline-secondary btn-copy border-0 text-muted p-2';

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <span className="d-flex align-items-center">
        <h1 className="m-0">{latterLink}</h1>
        { pageId != null && !isEmpty && (
          <div className="mx-2">
            <CopyDropdown pageId={pageId} pagePath={pagePath} dropdownToggleId={copyDropdownId} dropdownToggleClassName={copyDropdownToggleClassName}>
              <i className="ti ti-clipboard"></i>
            </CopyDropdown>
          </div>
        ) }
      </span>
    </div>
  );
};

export default PagePathNav;
