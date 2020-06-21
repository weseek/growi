import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { debounce } from 'throttle-debounce';

const logger = loggerFactory('growi:cli:StickyStretchableScroller');


const StickyStretchableScroller = (props) => {

  const {
    children, contentsElemSelector, calcViewHeightFunc, calcContentsHeightFunc,
  } = props;

  const id = children.props.id;

  /**
   * Reset scrollbar
   */
  const resetScrollbar = () => {
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

    if (viewHeight < contentsHeight) {
      $(`#${id}`).slimScroll({
        railVisible: true,
        position: 'right',
        height: viewHeight,
      });
    }
    else {
      $(`#${id}`).slimScroll({ destroy: true });
    }
  };
  const resetScrollbarDebounced = debounce(100, resetScrollbar);


  // setup resize event
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

  // setup update scrollbar effect
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
  children: PropTypes.node.isRequired,
  contentsElemSelector: PropTypes.string.isRequired,

  calcViewHeightFunc: PropTypes.func,
  calcContentsHeightFunc: PropTypes.func,
};

export default StickyStretchableScroller;
