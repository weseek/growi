import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';

import StickyEvents from 'sticky-events';
import { debounce } from 'throttle-debounce';

import { useSWRxCurrentPage } from '~/stores/page';
import { useSidebarCollapsed } from '~/stores/ui';
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

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(0);

  // use more specific type HTMLDivElement for avoid assertion error.
  // see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement
  const fixedContainerRef = useRef<HTMLDivElement>(null);
  const clientWidth = fixedContainerRef.current?.parentElement?.clientWidth;

  const initWidth = useCallback(() => {
    if (fixedContainerRef.current != null && fixedContainerRef.current.parentElement != null) {
      // get parent elements width
      const { clientWidth } = fixedContainerRef.current.parentElement;
      setWidth(clientWidth);
    }
  }, []);

  const stickyChangeHandler = useCallback((event) => {
    logger.debug('StickyEvents.CHANGE detected');
    setIsVisible(event.detail.isSticky);
  }, []);

  // setup effect by sticky-events
  useEffect(() => {
    // sticky-events
    // See: https://github.com/ryanwalters/sticky-events
    const { stickySelector } = new StickyEvents({ stickySelector: '#grw-subnav-sticky-trigger' });
    const elem = document.querySelector(stickySelector);
    elem.addEventListener(StickyEvents.CHANGE, stickyChangeHandler);

    // return clean up handler
    return () => {
      elem.removeEventListener(StickyEvents.CHANGE, stickyChangeHandler);
    };
  }, [stickyChangeHandler]);

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
    <div className={`${styles['grw-subnav-switcher']} ${isVisible ? '' : 'grw-subnav-switcher-hidden'}`}>
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
