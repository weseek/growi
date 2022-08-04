import React, {
  useMemo, useState, useRef, useEffect, useCallback,
} from 'react';

import PropTypes from 'prop-types';
import StickyEvents from 'sticky-events';
import { debounce } from 'throttle-debounce';

import { useSidebarCollapsed } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import GrowiContextualSubNavigation from './GrowiContextualSubNavigation';

import styles from './GrowiSubNavigationSwitcher.module.scss';

const logger = loggerFactory('growi:cli:GrowiSubNavigationSticky');


/**
 * Subnavigation
 *
 * needs:
 *   #grw-subnav-fixed-container element
 *   #grw-subnav-sticky-trigger element
 *
 * @param {object} props
 */
const GrowiSubNavigationSwitcher = (props) => {

  const { data: isSidebarCollapsed } = useSidebarCollapsed();

  const [isVisible, setVisible] = useState(false);
  const [width, setWidth] = useState(null);

  const fixedContainerRef = useRef();
  /*
  * Comment out to prevent err >>> TypeError: Cannot read properties of null (reading 'bottom')
  * The above err occurs when moving to admin page after rendering normal pages.
  * This is because id "grw-subnav-sticky-trigger" does not exist on admin pages.
  */
  // const stickyEvents = useMemo(() => new StickyEvents({ stickySelector: '#grw-subnav-sticky-trigger' }), []);

  const initWidth = useCallback(() => {
    const instance = fixedContainerRef.current;

    if (instance == null || instance.parentNode == null) {
      return;
    }

    // get parent width
    const { clientWidth } = instance.parentNode;
    // update style
    setWidth(clientWidth);
  }, []);

  // const initVisible = useCallback(() => {
  //   const elements = stickyEvents.stickyElements;

  //   for (const elem of elements) {
  //     const bool = stickyEvents.isSticking(elem);
  //     if (bool) {
  //       setVisible(bool);
  //       break;
  //     }
  //   }

  // }, [stickyEvents]);

  // setup effect by resizing event
  useEffect(() => {
    const resizeHandler = debounce(100, initWidth);

    window.addEventListener('resize', resizeHandler);

    // return clean up handler
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [initWidth]);

  const stickyChangeHandler = useCallback((event) => {
    logger.debug('StickyEvents.CHANGE detected');
    setVisible(event.detail.isSticky);
  }, []);

  // // setup effect by sticky event
  // useEffect(() => {
  //   // sticky
  //   // See: https://github.com/ryanwalters/sticky-events
  //   const { stickySelector } = stickyEvents;
  //   const elem = document.querySelector(stickySelector);
  //   elem.addEventListener(StickyEvents.CHANGE, stickyChangeHandler);

  //   // return clean up handler
  //   return () => {
  //     elem.removeEventListener(StickyEvents.CHANGE, stickyChangeHandler);
  //   };
  // }, [stickyChangeHandler, stickyEvents]);

  // update width when sidebar collapsing changed
  useEffect(() => {
    if (isSidebarCollapsed != null) {
      setTimeout(initWidth, 300);
    }
  }, [isSidebarCollapsed, initWidth]);

  // // initialize
  // useEffect(() => {
  //   initWidth();

  //   // check sticky state several times
  //   setTimeout(initVisible, 100);
  //   setTimeout(initVisible, 300);
  //   setTimeout(initVisible, 2000);

  // }, [initWidth, initVisible]);

  // ${styles['grw-subnav-switcher']}

  return (
    <div className={`${styles['grw-subnav-switcher']} ${isVisible ? '' : 'grw-subnav-switcher-hidden'}`}>
      <div
        id="grw-subnav-fixed-container"
        className={`grw-subnav-fixed-container ${styles['grw-subnav-fixed-container']} position-fixed grw-subnav-append-shadow-container`}
        ref={fixedContainerRef}
        style={{ width }}
      >
        <GrowiContextualSubNavigation isCompactMode isLinkSharingDisabled />
      </div>
    </div>
  );
};

GrowiSubNavigationSwitcher.propTypes = {
  isLinkSharingDisabled: PropTypes.bool,
};

export default GrowiSubNavigationSwitcher;
