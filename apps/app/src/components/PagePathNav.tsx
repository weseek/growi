import React, { FC } from 'react';

import { DevidedPagePath } from '@growi/core/dist/models';
import { pagePathUtils } from '@growi/core/dist/utils';
import dynamic from 'next/dynamic';

import { useIsNotFound } from '~/stores/page';

import LinkedPagePath from '../models/linked-page-path';

import PagePathHierarchicalLink from './PagePathHierarchicalLink';

const { isTrashPage } = pagePathUtils;

type Props = {
  pagePath: string,
  pageId?: string | null,
  isSingleLineMode?:boolean,
  isCompactMode?:boolean,
}

const CopyDropdown = dynamic(() => import('./Page/CopyDropdown'), { ssr: false });

export const PagePathNav: FC<Props> = (props: Props) => {
  const {
    pageId, pagePath, isSingleLineMode, isCompactMode,
  } = props;
  const dPagePath = new DevidedPagePath(pagePath, false, true);

  const { data: isNotFound } = useIsNotFound();

  const isInTrash = isTrashPage(pagePath);

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot || isSingleLineMode) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} isInTrash={isInTrash} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} isInTrash={isInTrash} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />;
  }

  const copyDropdownId = `copydropdown${isCompactMode ? '-subnav-compact' : ''}-${pageId}`;
  const copyDropdownToggleClassName = 'd-block btn-outline-secondary btn-copy border-0 text-muted p-2';

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <div className="d-flex align-items-center">
        <h1 className="m-0 text-truncate">{latterLink}</h1>
        { pageId != null && !isNotFound && (
          <div className="mx-2">
            <CopyDropdown pageId={pageId} pagePath={pagePath} dropdownToggleId={copyDropdownId} dropdownToggleClassName={copyDropdownToggleClassName}>
              <i className="ti ti-clipboard"></i>
            </CopyDropdown>
          </div>
        ) }
      </div>
    </div>
  );
};
