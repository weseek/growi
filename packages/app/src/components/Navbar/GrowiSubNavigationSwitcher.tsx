import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';

import { debounce } from 'throttle-debounce';

import { useSWRxCurrentPage } from '~/stores/page';
import { useSidebarCollapsed } from '~/stores/ui';
import { useSticky } from '~/stores/use-sticky';
import loggerFactory from '~/utils/logger';

import GrowiContextualSubNavigation from './GrowiContextualSubNavigation';

import styles from './GrowiSubNavigationSwitcher.module.scss';

const logger = loggerFactory('growi:cli:GrowiSubNavigationSticky');

export type GrowiSubNavigationSwitcherProps = {
  isLinkSharingDisabled: boolean,
}

/**
 * GrowiSubNavigation
 *
 * needs:
 *   #grw-subnav-fixed-container element
 *   #grw-subnav-sticky-trigger element
 */
export const GrowiSubNavigationSwitcher = (props: GrowiSubNavigationSwitcherProps): JSX.Element => {
  const { isLinkSharingDisabled } = props;

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: isSidebarCollapsed } = useSidebarCollapsed();

  const [width, setWidth] = useState<number>(0);

  // use more specific type HTMLDivElement for avoid assertion error.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
  const fixedContainerRef = useRef<HTMLDivElement>(null);
  const clientWidth = fixedContainerRef.current?.parentElement?.clientWidth;

  // Get sticky status
  const isSticky = useSticky('#grw-subnav-sticky-trigger');

  // Do not use clientWidth as useCallback deps, resizing events will not work in production builds.
  const initWidth = useCallback(() => {
    if (fixedContainerRef.current != null && fixedContainerRef.current.parentElement != null) {
      // get parent elements width
      const { clientWidth } = fixedContainerRef.current.parentElement;
      setWidth(clientWidth);
    }
  }, []);

  // setup effect by resizing event
  useEffect(() => {
    const resizeHandler = debounce(100, initWidth);
    window.addEventListener('resize', resizeHandler);

    // return clean up handler
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [initWidth]);

  // update width when sidebar collapsing changed
  useEffect(() => {
    if (isSidebarCollapsed != null) {
      setTimeout(initWidth, 300);
    }
  }, [isSidebarCollapsed, initWidth]);

  /*
   * initialize width.
   * Since width is not recalculated at production build first rendering,
   * make initWidth execution dependent on clientWidth.
   */
  useEffect(() => {
    if (clientWidth != null) initWidth();
  }, [initWidth, clientWidth]);

  if (currentPage == null) {
    return <></>;
  }

  return (
    <div className={`${styles['grw-subnav-switcher']} ${isSticky ? '' : 'grw-subnav-switcher-hidden'}`} data-testid="grw-subnav-switcher" >
      <div
        id="grw-subnav-fixed-container"
        className={`grw-subnav-fixed-container ${styles['grw-subnav-fixed-container']} position-fixed grw-subnav-append-shadow-container`}
        ref={fixedContainerRef}
        style={{ width }}
      >
        <GrowiContextualSubNavigation currentPage={currentPage} isCompactMode isLinkSharingDisabled={isLinkSharingDisabled} />
      </div>
    </div>
  );
};
