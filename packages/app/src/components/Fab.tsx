import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';

import { animateScroll } from 'react-scroll';
import { useRipple } from 'react-use-ripple';
import StickyEvents from 'sticky-events';

import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { useIsAbleToChangeEditorMode } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import { CreatePageIcon } from './Icons/CreatePageIcon';
import { ReturnTopIcon } from './Icons/ReturnTopIcon';

import styles from './Fab.module.scss';

const logger = loggerFactory('growi:cli:Fab');

export const Fab = (): JSX.Element => {

  const { data: isAbleToChangeEditorMode } = useIsAbleToChangeEditorMode();
  const { data: currentPath = '' } = useCurrentPagePath();
  const { open: openCreateModal } = usePageCreateModal();

  const [animateClasses, setAnimateClasses] = useState<string>('invisible');
  const [buttonClasses, setButtonClasses] = useState<string>('');
  const [isSticky, setIsSticky] = useState<boolean>(false);

  // ripple
  const createBtnRef = useRef(null);
  useRipple(createBtnRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

  /**
   * After the fade animation is finished, fix the button display status.
   * Prevents the fade animation occurred each time by button components rendered.
   * Check Fab.module.scss for fade animation time.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSticky) {
        setAnimateClasses('visible');
        setButtonClasses('');
      }
      else {
        setAnimateClasses('invisible');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isSticky]);

  const stickyChangeHandler = useCallback((event) => {
    logger.debug('StickyEvents.CHANGE detected');

    const newAnimateClasses = event.detail.isSticky ? 'animated fadeInUp faster' : 'animated fadeOut faster';
    const newButtonClasses = event.detail.isSticky ? '' : 'disabled grw-pointer-events-none';

    setAnimateClasses(newAnimateClasses);
    setButtonClasses(newButtonClasses);
    setIsSticky(event.detail.isSticky);
  }, []);

  // setup effect by sticky event
  useEffect(() => {
    // sticky
    // See: https://github.com/ryanwalters/sticky-events
    const stickySelector = '#grw-fav-sticky-trigger';
    const stickyElement = document.querySelector(stickySelector);
    if (stickyElement && stickyElement.getBoundingClientRect()) {
      const stickyEvents = new StickyEvents({ stickySelector });
      stickyEvents.enableEvents();
      stickyElement.addEventListener(StickyEvents.CHANGE, stickyChangeHandler);

      // return clean up handler
      return () => {
        stickyElement.removeEventListener(StickyEvents.CHANGE, stickyChangeHandler);
      };
    }
  }, [stickyChangeHandler]);

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
  }, [animateClasses, buttonClasses, currentPath, openCreateModal]);

  const ScrollToTopButton = useCallback(() => {
    const clickHandler = () => {
      animateScroll.scrollToTop({ duration: 200 });
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
      {isAbleToChangeEditorMode && <PageCreateButton />}
      <ScrollToTopButton />
    </div>
  );

};
