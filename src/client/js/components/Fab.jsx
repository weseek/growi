import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import StickyEvents from 'sticky-events';

import AppContainer from '../services/AppContainer';
import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';
import CreatePageIcon from './Icons/CreatePageIcon';
import ReturnTopIcon from './Icons/ReturnTopIcon';

const logger = loggerFactory('growi:cli:Fab');

const Fab = (props) => {
  const { navigationContainer, appContainer } = props;
  const { currentUser } = appContainer;

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

  function renderPageCreateButton() {
    return (
      <>
        <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: '2.3rem', right: '4rem' }}>
          <button
            type="button"
            className="btn btn-lg btn-create-page btn-primary rounded-circle p-0 waves-effect waves-light"
            onClick={navigationContainer.openPageCreateModal}
          >
            <CreatePageIcon />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="grw-fab d-none d-md-block">
      {currentUser != null && renderPageCreateButton()}
      <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: 0, right: 0 }}>
        <button type="button" className="btn btn-light btn-scroll-to-top rounded-circle p-0" onClick={() => navigationContainer.smoothScrollIntoView()}>
          <ReturnTopIcon />
        </button>
      </div>
    </div>
  );

};

Fab.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withUnstatedContainers(Fab, [AppContainer, NavigationContainer]);
