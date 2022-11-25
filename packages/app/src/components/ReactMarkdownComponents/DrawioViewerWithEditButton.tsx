import React, { useCallback, useState } from 'react';

import { DrawioViewer, DrawioViewerProps } from '@growi/remark-drawio-plugin';
import { useTranslation } from 'next-i18next';

import { useIsGuestUser, useIsSharedUser } from '~/stores/context';


import styles from './DrawioViewerWithEditButton.module.scss';


export const DrawioViewerWithEditButton = React.memo((props: DrawioViewerProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();

  const [isMounted, setMounted] = useState(false);

  const editButtonClickHandler = useCallback(() => {
  }, []);

  const renderingStartHandler = useCallback(() => {
    setMounted(false);
  }, []);

  const renderingUpdatedHandler = useCallback((hasError: boolean) => {
    setMounted(!hasError);
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
