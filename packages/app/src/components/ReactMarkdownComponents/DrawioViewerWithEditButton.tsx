import React, { useCallback, useState } from 'react';

import {
  DrawioViewer, DrawioViewerProps, IGraphViewer,
} from '@growi/remark-drawio-plugin';
import { useTranslation } from 'next-i18next';

import { useIsGuestUser, useIsSharedUser } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';

import styles from './DrawioViewerWithEditButton.module.scss';


export const DrawioViewerWithEditButton = React.memo((props: DrawioViewerProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { open: openDrawioModal } = useDrawioModal();

  const [isMounted, setMounted] = useState(false);
  const [mxfile, setMxfile] = useState('');

  const editButtonClickHandler = useCallback(() => {
    openDrawioModal(mxfile);
  }, [mxfile, openDrawioModal]);

  const renderingStartHandler = useCallback(() => {
    setMounted(false);
  }, []);

  const renderingUpdatedHandler = useCallback((viewer: IGraphViewer | null) => {
    setMounted(viewer != null);

    if (viewer != null) {
      setMxfile(viewer.xml);
    }
  }, []);

  const showEditButton = isMounted && !isGuestUser && !isSharedUser;

  return (
    <div className={`drawio-viewer-with-edit-button ${styles['drawio-viewer-with-edit-button']}`}>
      { showEditButton && (
        <button
          type="button"
          className="btn btn-outline-secondary btn-edit-drawio"
          onClick={editButtonClickHandler}
        >
          <i className="icon-note mr-1"></i>{t('Edit')}
        </button>
      ) }
      <DrawioViewer {...props} onRenderingStart={renderingStartHandler} onRenderingUpdated={renderingUpdatedHandler} />
    </div>
  );
});
DrawioViewerWithEditButton.displayName = 'DrawioViewerWithEditButton';
