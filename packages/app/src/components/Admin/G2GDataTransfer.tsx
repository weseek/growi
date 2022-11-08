import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useGenerateTransferKeyWithThrottle } from '~/client/services/g2g-transfer';
import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import { useAdminSocket } from '~/stores/socket-io';

import CustomCopyToClipBoard from '../Common/CustomCopyToClipBoard';

import G2GDataTransferExportForm from './G2GDataTransferExportForm';
import G2GDataTransferStatusIcon from './G2GDataTransferStatusIcon';

const IGNORED_COLLECTION_NAMES = [
  'sessions', 'rlflx', 'activities', 'attachmentFiles.files', 'attachmentFiles.chunks',
];

/**
 * Get the union type of all the values in an object, array or array-like type `T`
 * @see {@link https://github.com/piotrwitek/utility-types/blob/df2502ef504c4ba8bd9de81a45baef112b7921d0/src/mapped-types.ts#L589-L597}
 */
type ValuesType<
  T extends ReadonlyArray<any> | ArrayLike<any> | Record<any, any>
> = T extends ReadonlyArray<any>
  ? T[number]
  : T extends ArrayLike<any>
  ? T[number]
  : T extends object
  ? T[keyof T]
  : never;

/**
 * G2G transfer progress status master
 */
const G2G_PROGRESS_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
} as const;

/**
 * G2G transfer progress status
 */
type G2GProgressStatus = ValuesType<typeof G2G_PROGRESS_STATUS>

/**
 * G2G transfer progress
 */
interface G2GProgress {
  mongo: G2GProgressStatus;
  attachments: G2GProgressStatus;
}

const G2GDataTransfer = (): JSX.Element => {
  const { data: socket } = useAdminSocket();
  const { t } = useTranslation();

  const [startTransferKey, setStartTransferKey] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [optionsMap, setOptionsMap] = useState<any>({});
  const [isShowExportForm, setShowExportForm] = useState(false);
  const [isTransferring, setTransferring] = useState(false);
  const [g2gProgress, setG2GProgress] = useState<G2GProgress>({
    mongo: G2G_PROGRESS_STATUS.PENDING,
    attachments: G2G_PROGRESS_STATUS.PENDING,
  });

  const updateSelectedCollections = (newSelectedCollections: Set<string>) => {
    setSelectedCollections(newSelectedCollections);
  };

  const updateOptionsMap = (newOptionsMap: any) => {
    setOptionsMap(newOptionsMap);
  };

  const onChangeTransferKeyHandler = useCallback((e) => {
    setStartTransferKey(e.target.value);
  }, []);

  const setCollectionsAndSelectedCollections = useCallback(async() => {
    const [{ data: collectionsData }, { data: statusData }] = await Promise.all([
      apiv3Get<{collections: any[]}>('/mongo/collections', {}),
      apiv3Get<{status: { zipFileStats: any[], isExporting: boolean, progressList: any[] }}>('/export/status', {}),
    ]);

    // filter only not ignored collection names
    const filteredCollections = collectionsData.collections.filter((collectionName) => {
      return !IGNORED_COLLECTION_NAMES.includes(collectionName);
    });

    setCollections(filteredCollections);
    setSelectedCollections(new Set(filteredCollections));
  }, []);

  const setupWebsocketEventHandler = useCallback(() => {
    if (socket != null) {
      socket.on('admin:g2gProgress', (g2gProgress: G2GProgress) => {
        setG2GProgress(g2gProgress);

        if (g2gProgress.mongo === G2G_PROGRESS_STATUS.COMPLETED && g2gProgress.attachments === G2G_PROGRESS_STATUS.COMPLETED) {
          toastSuccess(t('admin:g2g:transfer_success'));
        }
      });

      socket.on('admin:g2gError', ({ key }) => {
        setTransferring(false);
        toastError(t(key));
      });
    }
  }, [socket, t, setTransferring, setG2GProgress]);

  const cleanUpWebsocketEventHandler = useCallback(() => {
    if (socket != null) {
      socket.off('admin:g2gProgress');
      socket.off('admin:g2gError');
    }
  }, [socket]);

  const { transferKey, generateTransferKeyWithThrottle } = useGenerateTransferKeyWithThrottle();

  const onClickHandler = useCallback(() => {
    generateTransferKeyWithThrottle();
  }, [generateTransferKeyWithThrottle]);

  const startTransfer = useCallback(async(e) => {
    e.preventDefault();
    setTransferring(true);

    try {
      await apiv3Post('/g2g-transfer/transfer', {
        transferKey: startTransferKey,
        collections: Array.from(selectedCollections),
        optionsMap,
      });
    }
    catch (errs) {
      toastError(errs);
    }
  }, [setTransferring, startTransferKey, selectedCollections, optionsMap]);

  useEffect(() => {
    setCollectionsAndSelectedCollections();
    setupWebsocketEventHandler();

    return () => {
      cleanUpWebsocketEventHandler();
    };
  }, [setCollectionsAndSelectedCollections, setupWebsocketEventHandler, cleanUpWebsocketEventHandler]);

  return (
    <div data-testid="admin-export-archive-data">
      <h2 className="border-bottom">{t('admin:g2g_data_transfer.transfer_data_to_another_growi')}</h2>

      <button type="button" className="btn btn-outline-secondary mt-4" disabled={isTransferring} onClick={() => setShowExportForm(!isShowExportForm)}>
        {t('admin:g2g_data_transfer.advanced_options')}
      </button>

      {collections.length !== 0 && (
        <div className={isShowExportForm ? '' : 'd-none'}>
          <G2GDataTransferExportForm
            allCollectionNames={collections}
            selectedCollections={selectedCollections}
            updateSelectedCollections={updateSelectedCollections}
            optionsMap={optionsMap}
            updateOptionsMap={updateOptionsMap}
          />
        </div>
      )}

      <form onSubmit={startTransfer}>
        <div className="form-group row mt-3">
          <div className="col-9">
            <input
              className="form-control"
              type="text"
              placeholder={t('admin:g2g_data_transfer.paste_transfer_key')}
              onChange={onChangeTransferKeyHandler}
              required
            />
          </div>
          <div className="col-3">
            <button type="submit" className="btn btn-primary w-100">{t('admin:g2g_data_transfer.start_transfer')}</button>
          </div>
        </div>
      </form>

      {isTransferring && (
        <div className='border rounded p-4'>
          <div>
            <G2GDataTransferStatusIcon className='mr-2 mb-2' status={g2gProgress.mongo} /> MongoDB
          </div>
          <div>
            <G2GDataTransferStatusIcon className='mr-2' status={g2gProgress.attachments} /> Attachments
          </div>
        </div>
      )}

      <h2 className="border-bottom mt-5">{t('admin:g2g_data_transfer.transfer_data_to_this_growi')}</h2>

      <div className="form-group row mt-4">
        <div className="col-md-3">
          <button type="button" className="btn btn-primary w-100" onClick={onClickHandler}>
            {t('admin:g2g_data_transfer.publish_transfer_key')}
          </button>
        </div>
        <div className="col-md-9">
          <div className="input-group-prepend mx-1">
            <input className="form-control" type="text" value={transferKey} readOnly />
            <CustomCopyToClipBoard textToBeCopied={transferKey} message="admin:slack_integration.copied_to_clipboard" />
          </div>
        </div>
      </div>

      <div className="alert alert-warning mt-4">
        <p className="mb-1">{t('admin:g2g_data_transfer.transfer_key_limit')}</p>
        <p className="mb-1">{t('admin:g2g_data_transfer.once_transfer_key_used')}</p>
        <p className="mb-0">{t('admin:g2g_data_transfer.transfer_to_growi_cloud')}</p>
      </div>
    </div>
  );
};

export default G2GDataTransfer;
