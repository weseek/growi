import React, { useState, useEffect, useCallback } from 'react';
// import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import StickyEvents from 'sticky-events';
import { debounce } from 'throttle-debounce';

import GrowiSubNavigation from './GrowiSubNavigation';

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

  const [isVisible, setVisible] = useState(false);

  const resetWidth = useCallback(() => {
    const elem = document.getElementById('grw-subnav-fixed-container');

    if (elem == null || elem.parentNode == null) {
      return;
    }

    // get parent width
    const { clientWidth: width } = elem.parentNode;
    // update style
    elem.style.width = `${width}px`;
  }, []);

  // setup effect by resizing event
  useEffect(() => {
    const resizeHandler = debounce(100, resetWidth);

    window.addEventListener('resize', resizeHandler);

    // return clean up handler
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [resetWidth]);

  const stickyChangeHandler = useCallback((event) => {
    logger.debug('StickyEvents.CHANGE detected');
    setVisible(event.detail.isSticky);
  }, []);

  // setup effect by sticky event
  useEffect(() => {
    // sticky
    // See: https://github.com/ryanwalters/sticky-events
    const stickyEvents = new StickyEvents({ stickySelector: '#grw-subnav-sticky-trigger' });
    const { stickySelector } = stickyEvents;
    const elem = document.querySelector(stickySelector);
    elem.addEventListener(StickyEvents.CHANGE, stickyChangeHandler);

    // return clean up handler
    return () => {
      elem.removeEventListener(StickyEvents.CHANGE, stickyChangeHandler);
    };
  }, [stickyChangeHandler]);

  // update width
  useEffect(() => {
    resetWidth();
  });

  return (
    <div className={`grw-subnav-switcher ${isVisible ? '' : 'grw-subnav-switcher-hidden'}`}>
      <div id="grw-subnav-fixed-container" className="grw-subnav-fixed-container position-fixed">
        <GrowiSubNavigation isCompactMode />
      </div>
    </div>
  );
};

GrowiSubNavigationSwitcher.propTypes = {
};

export default GrowiSubNavigationSwitcher;
