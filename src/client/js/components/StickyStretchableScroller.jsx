import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { debounce } from 'throttle-debounce';
import StickyEvents from 'sticky-events';

import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:cli:StickyStretchableScroller');


const StickyStretchableScroller = (props) => {

  const {
    navigationContainer,
    children, contentsElemSelector, stickyElemSelector,
    calcViewHeightFunc, calcContentsHeightFunc,
  } = props;

  const id = children.props.id;


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

    logger.debug('viewHeight', viewHeight);
    logger.debug('contentsHeight', contentsHeight);

    $(`#${id}`).slimScroll({
      railVisible: true,
      position: 'right',
      height: viewHeight,
    });
    if (contentsHeight < viewHeight) {
      $(`#${id}`).slimScroll({ destroy: true });
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
  children: PropTypes.node.isRequired,
  contentsElemSelector: PropTypes.string.isRequired,

  stickyElemSelector: PropTypes.string,

  calcViewHeightFunc: PropTypes.func,
  calcContentsHeightFunc: PropTypes.func,
};

export default withUnstatedContainers(StickyStretchableScroller, [NavigationContainer]);
