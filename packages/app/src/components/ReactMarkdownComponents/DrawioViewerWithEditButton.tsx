import React, { useCallback } from 'react';

import { DrawioViewer, DrawioViewerProps } from '@growi/remark-drawio-plugin';
import { useTranslation } from 'next-i18next';

import { useIsGuestUser, useIsSharedUser } from '~/stores/context';

import NotAvailableForGuest from '../NotAvailableForGuest';


export const DrawioViewerWithEditButton = React.memo((props: DrawioViewerProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();

  const editButtonClickHandler = useCallback(() => {

  }, []);

  const renderingUpdatedHandler = useCallback(() => {

  }, []);

  const showEditButton = !isGuestUser && !isSharedUser;

  return (
    <div>
      { showEditButton && (
        <NotAvailableForGuest>
          <button type="button" className="drawio-iframe-trigger position-absolute btn btn-outline-secondary" onClick={editButtonClickHandler}>
            <i className="icon-note mr-1"></i>{t('Edit')}
          </button>
        </NotAvailableForGuest>
      ) }
      <DrawioViewer {...props} onRenderingUpdated={renderingUpdatedHandler} />
    </div>
  );
});
DrawioViewerWithEditButton.displayName = 'DrawioViewerWithEditButton';
