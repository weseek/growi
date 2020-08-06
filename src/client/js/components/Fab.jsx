import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import StickyEvents from 'sticky-events';

import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';
import EditNewPageIcon from './EditNewPageIcon';

const logger = loggerFactory('growi:cli:Fab');

const Fab = (props) => {
  const { navigationContainer } = props;

  const [animateClasses, setAnimateClasses] = useState('invisible');


  const stickyChangeHandler = useCallback((event) => {
    logger.debug('StickyEvents.CHANGE detected');

    const classes = event.detail.isSticky ? 'animated fadeInUp faster' : 'animated fadeOut faster';
    setAnimateClasses(classes);
  }, []);

  // setup effect by sticky event
  useEffect(() => {
    // sticky
    // See: https://github.com/ryanwalters/sticky-events
    const stickyEvents = new StickyEvents({ stickySelector: '#grw-fav-sticky-trigger' });
    const { stickySelector } = stickyEvents;
    const elem = document.querySelector(stickySelector);
    elem.addEventListener(StickyEvents.CHANGE, stickyChangeHandler);

    // return clean up handler
    return () => {
      elem.removeEventListener(StickyEvents.CHANGE, stickyChangeHandler);
    };
  }, [stickyChangeHandler]);


  return (
    <div className="grw-fab d-none d-md-block">
      <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: '2.3rem', right: '4rem' }}>
        <button
          type="button"
          className="btn btn-lg btn-create-page btn-primary rounded-circle p-0 waves-effect waves-light"
          onClick={navigationContainer.openPageCreateModal}
        >
          <EditNewPageIcon />
        </button>
      </div>
      <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: 0, right: 0 }}>
        <button type="button" className="btn btn-light btn-scroll-to-top rounded-circle p-0" onClick={() => navigationContainer.smoothScrollIntoView()}>
          <i className="icon-control-start"></i>
        </button>
      </div>
    </div>
  );

};

Fab.propTypes = {
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(Fab, [NavigationContainer]);
