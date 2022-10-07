import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useGenerateTransferKeyWithThrottle } from '~/client/services/g2g-transfer';
import { toastError } from '~/client/util/apiNotification';
import { apiv3Get } from '~/client/util/apiv3-client';
import { useAdminSocket } from '~/stores/socket-io';
import customAxios from '~/utils/axios';


import CustomCopyToClipBoard from '../Common/CustomCopyToClipBoard';

import G2GDataTransferExportForm from './G2GDataTransferExportForm';

const IGNORED_COLLECTION_NAMES = [
  'sessions', 'rlflx', 'activities', 'attachmentFiles.files', 'attachmentFiles.chunks',
];

const G2GDataTransfer = (): JSX.Element => {
  const { data: socket } = useAdminSocket();
  const { t } = useTranslation();

  const [startTransferKey, setStartTransferKey] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [optionsMap, setOptionsMap] = useState<any>({});
  const [isShowExportForm, setShowExportForm] = useState(false);
  const [isTransferring, setTransferring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

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
      socket.on('admin:onStartTransferMongoData', () => {
        setTransferring(true);
        setStatusMessage(t('Transferring DB data ...'));
      });

      socket.on('admin:onStartTransferAttachments', () => {
        setStatusMessage(t('Transferring attachment files ...'));
      });

      socket.on('admin:onFinishTransfer', () => {
        setTransferring(false);
        setStatusMessage(t('Successfully transferred GROWI. Now you can use new GROWI !'));
      });
    }
  }, [socket, t]);

  const cleanUpWebsocketEventHandler = useCallback(() => {
    if (socket != null) {
      socket.off('admin:onStartTransferMongoData');

      socket.off('admin:onStartTransferAttachments');

      socket.off('admin:onFinishTransfer');
    }
  }, [socket]);

  const { transferKey, generateTransferKeyWithThrottle } = useGenerateTransferKeyWithThrottle();

  const onClickHandler = useCallback(() => {
    generateTransferKeyWithThrottle();
  }, [generateTransferKeyWithThrottle]);

  const startTransfer = useCallback(async(e) => {
    e.preventDefault();

    try {
      await customAxios.post('/_api/v3/g2g-transfer/transfer', {
        transferKey: startTransferKey,
        collections: Array.from(selectedCollections),
        optionsMap,
      });
    }
    catch (errs) {
      toastError('Failed to transfer');
    }
  }, [startTransferKey, selectedCollections, optionsMap]);

  useEffect(() => {
    setCollectionsAndSelectedCollections();

    setupWebsocketEventHandler();
  }, [setCollectionsAndSelectedCollections, setupWebsocketEventHandler]);

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


      {statusMessage != null && (
        <>
          <div className='alert alert-info d-flex align-items-center'>
            {isTransferring && (
              <i className="fa fa-2x fa-spinner fa-pulse mr-2"></i>
            )}
            <p className="mb-0">{statusMessage}</p>
          </div>
        </>
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
