import React, { useState, useCallback, useEffect } from 'react';

import StickyEvents from 'sticky-events';

import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import { useCurrentPathname, useCurrentUser } from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import CreatePageIcon from './Icons/CreatePageIcon';
import ReturnTopIcon from './Icons/ReturnTopIcon';

const logger = loggerFactory('growi:cli:Fab');

const Fab = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: currentPathname } = useCurrentPathname();

  const { open: openCreateModal } = usePageCreateModal();

  const [animateClasses, setAnimateClasses] = useState('invisible');
  const [buttonClasses, setButtonClasses] = useState('');

  const stickyChangeHandler = useCallback((event) => {
    logger.debug('StickyEvents.CHANGE detected');

    const newAnimateClasses = event.detail.isSticky ? 'animated fadeInUp faster' : 'animated fadeOut faster';
    const newButtonClasses = event.detail.isSticky ? '' : 'disabled grw-pointer-events-none';

    setAnimateClasses(newAnimateClasses);
    setButtonClasses(newButtonClasses);
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

  const basePath = currentPage?.path ?? currentPathname ?? '';
  function renderPageCreateButton() {
    return (
      <>
        <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: '2.3rem', right: '4rem' }}>
          <button
            type="button"
            className={`btn btn-lg btn-create-page btn-primary rounded-circle p-0 waves-effect waves-light ${buttonClasses}`}
            onClick={() => openCreateModal(basePath)}
          >
            <CreatePageIcon />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="grw-fab d-none d-md-block d-edit-none" data-testid="grw-fab">
      {currentUser != null && renderPageCreateButton()}
      <div data-testid="grw-fab-return-to-top" className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: 0, right: 0 }}>
        <button
          type="button"
          className={`btn btn-light btn-scroll-to-top rounded-circle p-0 ${buttonClasses}`}
          onClick={() => smoothScrollIntoView()}
        >
          <ReturnTopIcon />
        </button>
      </div>
    </div>
  );

};

export default Fab;
