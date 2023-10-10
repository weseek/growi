import React, { FC } from 'react';

import { DevidedPagePath } from '@growi/core/dist/models';
import { pagePathUtils } from '@growi/core/dist/utils';
import dynamic from 'next/dynamic';
import Sticky from 'react-stickynode';

import { useIsNotFound } from '~/stores/page';

import LinkedPagePath from '../../../models/linked-page-path';
import { PagePathHierarchicalLink } from '../PagePathHierarchicalLink';
import { CollapsedParentsDropdown } from '../PagePathHierarchicalLink/CollapsedParentsDropdown';

import styles from './PagePathNav.module.scss';


const { isTrashPage } = pagePathUtils;

type Props = {
  pagePath: string,
  pageId?: string | null,
  isSingleLineMode?: boolean,
  isCollapseParents?: boolean,
}

const CopyDropdown = dynamic(() => import('../CopyDropdown').then(mod => mod.CopyDropdown), { ssr: false });

export const PagePathNav: FC<Props> = (props: Props) => {
  const {
    pageId, pagePath, isSingleLineMode, isCollapseParents,
  } = props;
  const dPagePath = new DevidedPagePath(pagePath, false, true);

  const { data: isNotFound } = useIsNotFound();

  const isInTrash = isTrashPage(pagePath);

  let formerLink;
  let collapsedParent;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot || (!isCollapseParents && isSingleLineMode)) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} isInTrash={isInTrash} />;
  }
  // collapse parents
  else if (isCollapseParents) {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    collapsedParent = <CollapsedParentsDropdown linkedPagePath={linkedPagePathFormer} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} isInTrash={isInTrash} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />;
  }

  const copyDropdownId = `copydropdown-${pageId}`;
  const copyDropdownToggleClassName = 'd-block btn-outline-secondary btn-copy border-0 text-muted p-2';

  return (
    <div>
      {formerLink}
      <div className="d-flex align-items-center">
        <h1 className="m-0 fs-2 text-truncate">
          {collapsedParent}
          <span className={styles['grw-mr-02em']}>/</span>
          {latterLink}
        </h1>
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


type PagePathNavStickyProps = Omit<Props, 'isCollapseParents'>;

export const PagePathNavSticky = (props: PagePathNavStickyProps): JSX.Element => {
  return (
    <Sticky className={`${styles['grw-page-path-nav-sticky']} mb-4`} innerClass="mt-1" innerActiveClass="active">
      {({ status }: { status: boolean }) => {
        const isCollapseParents = status === Sticky.STATUS_FIXED;
        return <PagePathNav {...props} isCollapseParents={isCollapseParents} />;
      }}
    </Sticky>
  );
};
