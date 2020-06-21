import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { debounce } from 'throttle-debounce';
import StickyEvents from 'sticky-events';

import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:cli:StickyStretchableScroller');


/**
 * USAGE:
 *
  const calcViewHeight = useCallback(() => {
    const containerElem = document.querySelector('#sticky-elem');
    const containerTop = containerElem.getBoundingClientRect().top;

    // stretch to the bottom of window
    return window.innerHeight - containerTop;
  });

  return (
    <StickyStretchableScroller
      contentsElemSelector="#long-contents-elem"
      stickyElemSelector="#sticky-elem"
      calcViewHeightFunc={calcViewHeight}
    >
      <div id="scroll-elem">
        ...
      </div>
    </StickyStretchableScroller>
  );

  or

  return (
    <StickyStretchableScroller
      scrollTargetId="scroll-elem"
      contentsElemSelector="#long-contents-elem"
      stickyElemSelector="#sticky-elem"
      calcViewHeightFunc={calcViewHeight}
    />
  );
 */
const StickyStretchableScroller = (props) => {

  let { scrollTargetSelector } = props;
  const {
    navigationContainer,
    children, contentsElemSelector, stickyElemSelector,
    calcViewHeightFunc, calcContentsHeightFunc,
  } = props;

  if (scrollTargetSelector == null && children == null) {
    throw new Error('Either of scrollTargetSelector or children is required');
  }

  if (scrollTargetSelector == null) {
    scrollTargetSelector = `#${children.props.id}`;
  }

  /**
   * Reset scrollbar
   */
  const resetScrollbar = useCallback(() => {
    const contentsElem = document.querySelector(contentsElemSelector);
    if (contentsElem == null) {
      return;
    }

    const viewHeight = calcViewHeightFunc != null
      ? calcViewHeightFunc()
      : 'auto';
    const contentsHeight = calcContentsHeightFunc != null
      ? calcContentsHeightFunc(contentsElem)
      : contentsElem.getBoundingClientRect().height;

    logger.debug(`[${scrollTargetSelector}] viewHeight`, viewHeight);
    logger.debug(`[${scrollTargetSelector}] contentsHeight`, contentsHeight);

    $(scrollTargetSelector).slimScroll({
      color: '#666',
      railColor: '#999',
      railVisible: true,
      position: 'right',
      height: viewHeight,
    });
    if (contentsHeight < viewHeight) {
      $(scrollTargetSelector).slimScroll({ destroy: true });
    }
  }, [contentsElemSelector, calcViewHeightFunc, calcContentsHeightFunc]);

  const resetScrollbarDebounced = debounce(100, resetScrollbar);


  // setup effect by sticky event
  useEffect(() => {
    if (stickyElemSelector == null) {
      return;
    }

    // sticky
    // See: https://github.com/ryanwalters/sticky-events
    const stickyEvents = new StickyEvents({ stickySelector: stickyElemSelector });
    const { stickySelector } = stickyEvents;
    const elem = document.querySelector(stickySelector);
    elem.addEventListener(StickyEvents.CHANGE, (event) => {
      logger.debug('StickyEvents.CHANGE detected');
      resetScrollbar();
    });
  }, []);

  // setup effect by resizing event
  useEffect(() => {
    const resizeHandler = (event) => {
      resetScrollbarDebounced();
    };

    window.addEventListener('resize', resizeHandler);

    // return clean up handler
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  // setup effect by isScrollTop
  useEffect(() => {
    if (navigationContainer.state.isScrollTop) {
      resetScrollbar();
    }
  }, [navigationContainer.state.isScrollTop]);

  // setup effect by update props
  useEffect(() => {
    resetScrollbarDebounced();
  });

  return (
    <>
      { children }
    </>
  );
};

StickyStretchableScroller.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  contentsElemSelector: PropTypes.string.isRequired,

  children: PropTypes.node,
  scrollTargetSelector: PropTypes.string,
  stickyElemSelector: PropTypes.string,

  calcViewHeightFunc: PropTypes.func,
  calcContentsHeightFunc: PropTypes.func,
};

export default withUnstatedContainers(StickyStretchableScroller, [NavigationContainer]);
