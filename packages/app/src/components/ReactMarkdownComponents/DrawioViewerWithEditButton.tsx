import React, { useCallback, useState } from 'react';

import EventEmitter from 'events';

import {
  DrawioEditByViewerProps,
  DrawioViewer, DrawioViewerProps,
} from '@growi/remark-drawio';
import { useTranslation } from 'next-i18next';

import { useIsGuestUser, useIsSharedUser, useShareLinkId } from '~/stores/context';

import styles from './DrawioViewerWithEditButton.module.scss';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


export const DrawioViewerWithEditButton = React.memo((props: DrawioViewerProps): JSX.Element => {
  const { t } = useTranslation();

  const { bol, eol } = props;

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSharedUser } = useIsSharedUser();
  const { data: shareLinkId } = useShareLinkId();

  const [isRendered, setRendered] = useState(false);
  const [mxfile, setMxfile] = useState('');

  const editButtonClickHandler = useCallback(() => {
    const data: DrawioEditByViewerProps = {
      bol, eol, drawioMxFile: mxfile,
    };
    globalEmitter.emit('launchDrawioModal', data);
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

  const showEditButton = isRendered && !isGuestUser && !isSharedUser && shareLinkId == null;

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
