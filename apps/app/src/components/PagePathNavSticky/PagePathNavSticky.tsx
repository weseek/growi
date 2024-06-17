import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { DevidedPagePath } from '@growi/core/dist/models';
import { pagePathUtils } from '@growi/core/dist/utils';
import Sticky from 'react-stickynode';

import LinkedPagePath from '~/models/linked-page-path';
import {
  usePageControlsX, useCurrentProductNavWidth, useSidebarMode,
} from '~/stores/ui';

import { PagePathHierarchicalLink } from '../../components-universal/Common/PagePathHierarchicalLink';
import type { PagePathNavLayoutProps } from '../../components-universal/Common/PagePathNav';
import { PagePathNavLayout, Separator } from '../../components-universal/Common/PagePathNav';

import { CollapsedParentsDropdown } from './CollapsedParentsDropdown';

import styles from './PagePathNavSticky.module.scss';

const moduleClass = styles['grw-page-path-nav-sticky'];

const { isTrashPage } = pagePathUtils;


export const PagePathNavSticky = (props: PagePathNavLayoutProps): JSX.Element => {
  const { pagePath } = props;

  const { data: pageControlsX } = usePageControlsX();
  const { data: sidebarWidth } = useCurrentProductNavWidth();
  const { data: sidebarMode } = useSidebarMode();
  const pagePathNavRef = useRef<HTMLDivElement>(null);

  const [navMaxWidth, setNavMaxWidth] = useState<number | undefined>();

  useEffect(() => {
    if (pageControlsX == null || pagePathNavRef.current == null || sidebarWidth == null) {
      return;
    }
    setNavMaxWidth(pageControlsX - pagePathNavRef.current.getBoundingClientRect().x - 10);
  }, [pageControlsX, pagePathNavRef, sidebarWidth]);

  useEffect(() => {
    // wait for the end of the animation of the opening and closing of the sidebar
    const timeout = setTimeout(() => {
      if (pageControlsX == null || pagePathNavRef.current == null || sidebarMode == null) {
        return;
      }
      setNavMaxWidth(pageControlsX - pagePathNavRef.current.getBoundingClientRect().x - 10);
    }, 200);
    return () => {
      clearTimeout(timeout);
    };
  }, [pageControlsX, pagePathNavRef, sidebarMode]);

  // one line with collapsed parents
  const latterLink = useMemo(() => {
    const dPagePath = new DevidedPagePath(pagePath, false, true);

    const isInTrash = isTrashPage(pagePath);

    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);

    return (
      <>
        <CollapsedParentsDropdown linkedPagePath={linkedPagePathFormer} />
        <Separator />
        <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />
      </>
    );
  }, [pagePath]);

  return (
    // Controlling pointer-events
    //  1. disable pointer-events with 'pe-none'
    <div ref={pagePathNavRef}>
      <Sticky className={`${moduleClass} mb-4`} innerClass="mt-1 pe-none" innerActiveClass="active">
        {({ status }) => {
          const isCollapseParents = status === Sticky.STATUS_FIXED;
          return (
          // Controlling pointer-events
          //  2. enable pointer-events with 'pe-auto' only against the children
          //      which width is minimized by 'd-inline-block'
          //
            <div className="d-inline-block pe-auto">
              <PagePathNavLayout
                {...props}
                latterLink={latterLink}
                latterLinkClassName={isCollapseParents ? 'fs-3  text-truncate' : 'fs-2'}
                maxWidth={isCollapseParents ? navMaxWidth : undefined}
              />
            </div>
          );
        }}
      </Sticky>
    </div>
  );
};

PagePathNavSticky.displayName = 'PagePathNavSticky';
