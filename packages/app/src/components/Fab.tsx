import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';

import { animateScroll } from 'react-scroll';
import { useRipple } from 'react-use-ripple';
import StickyEvents from 'sticky-events';

import { DEFAULT_AUTO_SCROLL_OPTS } from '~/client/util/smooth-scroll';
import { useCurrentUser } from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { CreatePageIcon } from './Icons/CreatePageIcon';
import { ReturnTopIcon } from './Icons/ReturnTopIcon';

import styles from './Fab.module.scss';

const logger = loggerFactory('growi:cli:Fab');

export const Fab = (): JSX.Element => {

  const { data: currentUser } = useCurrentUser();
  const { data: currentPath = '' } = useCurrentPagePath();
  const { open: openCreateModal } = usePageCreateModal();

  const [animateClasses, setAnimateClasses] = useState('invisible');
  const [buttonClasses, setButtonClasses] = useState('');

  // ripple
  const createBtnRef = useRef(null);
  useRipple(createBtnRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

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

  // TODO: Flickering occurs when moving page if "currentPath" or "openCreateModal" is set to useCallback dependencies.
  const PageCreateButton = useCallback(() => {
    return (
      <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: '2.3rem', right: '4rem' }}>
        <button
          type="button"
          className={`btn btn-lg btn-create-page btn-primary rounded-circle p-0 ${buttonClasses}`}
          ref={createBtnRef}
          onClick={currentPath != null
            ? () => openCreateModal(currentPath)
            : undefined}
        >
          <CreatePageIcon />
        </button>
      </div>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateClasses, buttonClasses]); // , currentPath, openCreateModal]);

  const ScrollToTopButton = useCallback(() => {
    const clickHandler = () => {
      animateScroll.scrollToTop(DEFAULT_AUTO_SCROLL_OPTS);
    };

    return (
      <div className={`rounded-circle position-absolute ${animateClasses}`} style={{ bottom: 0, right: 0 }} data-testid="grw-fab-return-to-top">
        <button
          type="button"
          className={`btn btn-light btn-scroll-to-top rounded-circle p-0 ${buttonClasses}`}
          onClick={clickHandler}
        >
          <ReturnTopIcon />
        </button>
      </div>
    );
  }, [animateClasses, buttonClasses]);

  if (currentPath == null) {
    return <></>;
  }

  return (
    <div className={`${styles['grw-fab']} grw-fab d-none d-md-block d-edit-none`} data-testid="grw-fab-container">
      {currentUser != null && <PageCreateButton />}
      <ScrollToTopButton />
    </div>
  );

};
