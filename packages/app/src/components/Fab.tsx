import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';

import { animateScroll } from 'react-scroll';
import { useRipple } from 'react-use-ripple';

import { useSticky } from '~/client/side-effects/use-sticky';
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
  const [isStickyApplied, setIsStickyApplied] = useState(false);

  // ripple
  const createBtnRef = useRef(null);
  useRipple(createBtnRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

  // Get sticky status
  const isSticky = useSticky('#grw-fav-sticky-trigger');

  // check if isSticky is already initialized then save it in isStickyApplied state
  useEffect(() => {
    if (isSticky) {
      setIsStickyApplied(true);
    }
  }, [isSticky]);

  // Apply new classes if only isSticky is initialized, otherwise no classes have changed
  // Prevents the Fab button from showing on first load due to the isSticky effect
  useEffect(() => {
    if (isStickyApplied) {
      const timer = setTimeout(() => {
        if (isSticky) {
          setAnimateClasses('visible');
          setButtonClasses('');
        }
        else {
          setAnimateClasses('invisible');
        }
      }, 500);

      const newAnimateClasses = isSticky ? 'animated fadeInUp faster' : 'animated fadeOut faster';
      const newButtonClasses = isSticky ? '' : 'disabled grw-pointer-events-none';

      setAnimateClasses(newAnimateClasses);
      setButtonClasses(newButtonClasses);

      return () => clearTimeout(timer);
    }
  }, [isSticky, isStickyApplied]);

  const PageCreateButton = useCallback(() => {
    return (
      <div
        className={`rounded-circle position-absolute ${animateClasses}`}
        style={{ bottom: '2.3rem', right: '4rem' }}
        data-testid="grw-fab-page-create-button"
      >
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
