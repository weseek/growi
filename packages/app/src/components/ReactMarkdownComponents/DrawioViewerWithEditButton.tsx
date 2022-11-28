import React, { useCallback, useState } from 'react';

import {
  DrawioEditByViewerProps,
  DrawioViewer, DrawioViewerProps, extractCodeFromMxfile,
} from '@growi/remark-drawio-plugin';
import { useTranslation } from 'next-i18next';

import { useIsGuestUser, useIsSharedUser } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';

import styles from './DrawioViewerWithEditButton.module.scss';


export const DrawioViewerWithEditButton = React.memo((props: DrawioViewerProps): JSX.Element => {
  const { t } = useTranslation();

  const { bol, eol } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();

  const [isRendered, setRendered] = useState(false);
  const [mxfile, setMxfile] = useState('');

  const editButtonClickHandler = useCallback(() => {
    const data: DrawioEditByViewerProps = {
      bol, eol, drawioMxFile: extractCodeFromMxfile(mxfile),
    };
    window.globalEmitter.emit('launchDrawioModal', data);
  }, [bol, eol, mxfile]);

  const renderingStartHandler = useCallback(() => {
    setRendered(false);
  }, []);

  const renderingUpdatedHandler = useCallback((mxfile: string | null) => {
    setRendered(mxfile != null);

    if (mxfile != null) {
      setMxfile(mxfile);
    }
  }, []);

  const showEditButton = isRendered && !isGuestUser && !isSharedUser;

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
