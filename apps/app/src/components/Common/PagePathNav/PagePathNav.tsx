import type { FC } from 'react';
import React from 'react';

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
  isWipPage?: boolean,
  isSingleLineMode?: boolean,
  isCollapseParents?: boolean,
  formerLinkClassName?: string,
  latterLinkClassName?: string,
}

const CopyDropdown = dynamic(() => import('../CopyDropdown').then(mod => mod.CopyDropdown), { ssr: false });

const Separator = (): JSX.Element => {
  return <span className={styles['grw-mx-02em']}>/</span>;
};

export const PagePathNav: FC<Props> = (props: Props) => {
  const {
    pageId, pagePath, isWipPage, isSingleLineMode, isCollapseParents,
    formerLinkClassName, latterLinkClassName,
  } = props;
  const dPagePath = new DevidedPagePath(pagePath, false, true);

  const { data: isNotFound } = useIsNotFound();

  const isInTrash = isTrashPage(pagePath);

  let formerLink;
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
    latterLink = (
      <>
        <CollapsedParentsDropdown linkedPagePath={linkedPagePathFormer} />
        <Separator />
        <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />
      </>
    );
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = (
      <div className="fs-5">
        <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} isInTrash={isInTrash} />
        <Separator />
      </div>
    );
    latterLink = (
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />
    );
  }

  const copyDropdownId = `copydropdown-${pageId}`;

  return (
    <div>
      <span className={formerLinkClassName}>{formerLink}</span>
      <div className="d-flex align-items-center">
        <h1 className={`m-0 ${latterLinkClassName}`}>
          {latterLink}
        </h1>
        { pageId != null && !isNotFound && (
          <div className="d-flex align-items-center ms-2">
            { isWipPage && (
              <span className="badge rounded-pill text-bg-secondary ms-1 me-1">WIP</span>
            )}
            <CopyDropdown pageId={pageId} pagePath={pagePath} dropdownToggleId={copyDropdownId} dropdownToggleClassName="p-2">
              <span className="material-symbols-outlined">content_paste</span>
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
    // Controlling pointer-events
    //  1. disable pointer-events with 'pe-none'
    <Sticky className={`${styles['grw-page-path-nav-sticky']} mb-4`} innerClass="mt-1 pe-none" innerActiveClass="active">
      {({ status }: { status: boolean }) => {
        const isCollapseParents = status === Sticky.STATUS_FIXED;
        return (
          // Controlling pointer-events
          //  2. enable pointer-events with 'pe-auto' only against the children
          //      which width is minimized by 'd-inline-block'
          <div className={`d-inline-block pe-auto ${isCollapseParents ? 'is-collapse-with-top' : ''}`}>
            <PagePathNav {...props} isCollapseParents={isCollapseParents} latterLinkClassName={isCollapseParents ? 'fs-3  text-truncate' : 'fs-2'} />
          </div>
        );
      }}
    </Sticky>
  );
};
