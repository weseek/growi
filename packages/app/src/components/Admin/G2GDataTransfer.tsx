import React, { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import AdminSocketIoContainer from '~/client/services/AdminSocketIoContainer';
import { apiv3Get } from '~/client/util/apiv3-client';

import { withUnstatedContainers } from '../UnstatedUtils';

import SelectCollectionsModal from './ExportArchiveData/SelectCollectionsModal';

const IGNORED_COLLECTION_NAMES = [
  'sessions', 'rlflx', 'activities',
];

type Props = {
  adminSocketIoContainer: AdminSocketIoContainer,
};

const G2GDataTransfer = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { adminSocketIoContainer } = props;

  const [collections, setCollections] = useState<any[]>([]);
  const [zipFileStats, setZipFileStats] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [isZipping, setZipping] = useState(false);
  const [isExported, setExported] = useState(false);
  const [transferKey, setTransferKey] = useState('');

  const fetchData = useCallback(async() => {
    // TODO:: use apiv3.get
    // eslint-disable-next-line no-unused-vars
    const [{ data: collectionsData }, { data: statusData }] = await Promise.all([
      apiv3Get<{collections: any[]}>('/mongo/collections', {}),
      apiv3Get<{status: { zipFileStats: any[], isExporting: boolean, progressList: any[] }}>('/export/status', {}),
    ]);
    // TODO: toastSuccess, toastError

    // filter only not ignored collection names
    const filteredCollections = collectionsData.collections.filter((collectionName) => {
      return !IGNORED_COLLECTION_NAMES.includes(collectionName);
    });

    const { zipFileStats, isExporting, progressList } = statusData.status;
    setCollections(filteredCollections);
    setZipFileStats(zipFileStats);
    setExporting(isExporting);
    setProgressList(progressList);
  }, []);

  const setupWebsocketEventHandler = useCallback(() => {
    const socket = adminSocketIoContainer.getSocket();

    // websocket event
    socket.on('admin:onProgressForExport', ({ currentCount, totalCount, progressList }) => {
      setExporting(true);
      setProgressList(progressList);
    });

    // websocket event
    socket.on('admin:onStartZippingForExport', () => {
      setZipping(true);
    });

    // websocket event
    socket.on('admin:onTerminateForExport', ({ addedZipFileStat }) => {

      setExporting(false);
      setZipping(false);
      setExported(true);
      setZipFileStats(prev => prev.concat([addedZipFileStat]));

      // TODO: toastSuccess, toastError
      toastr.success(undefined, `New Archive Data '${addedZipFileStat.fileName}' is added`, {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
    });
  }, [adminSocketIoContainer]);

  const publishTransferKey = () => {
    // 移行キー発行の処理
    setTransferKey('transferKey');
  };

  const transferData = () => {
    // データ移行の処理
  };

  const exportingRequestedHandler = useCallback(() => {}, []);

  useEffect(() => {
    fetchData();

    setupWebsocketEventHandler();
  }, [fetchData, setupWebsocketEventHandler]);

  return (
    <div data-testid="admin-export-archive-data">
      <h2 className="border-bottom">このGROWIのデータを別GROWIへ移行する</h2>

      <button type="button" className="btn btn-outline-secondary mt-4" disabled={isExporting} onClick={() => setExportModalOpen(true)}>
        詳細オプション
      </button>

      <form onSubmit={transferData}>
        <div className="form-group row mt-3">
          <div className="col-9">
            <input className="form-control" type="text" placeholder="移行キーをここにペースト" />
          </div>
          <div className="col-3">
            <button type="submit" className="btn btn-primary w-100">移行を開始する</button>
          </div>
        </div>
      </form>

      <h2 className="border-bottom mt-5">別GROWIのデータをこのGROWIへ移行する</h2>

      <div className="form-group row mt-4">
        <div className="col-3">
          <button type="button" className="btn btn-primary w-100" onClick={publishTransferKey}>移行キーを発行する</button>
        </div>
        <div className="col-9">
          <input className="form-control" type="text" value={transferKey} readOnly />
        </div>
      </div>

      <p className="mt-4 mb-1">※ 移行キーの有効期限は発行から1時間となります。</p>
      <p className="mb-1">※ 移行キーは一度移行に利用するとそれ移行はご利用いただけなくなります。</p>
      <p className="mb-1">※ GROWI.cloud への移行を実施する場合はこちらをご確認ください。</p>

      <SelectCollectionsModal
        isOpen={isExportModalOpen}
        onExportingRequested={exportingRequestedHandler}
        onClose={() => setExportModalOpen(false)}
        collections={collections}
      />
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const G2GDataTransferWrapper = withUnstatedContainers(G2GDataTransfer, [AdminSocketIoContainer]);

export default G2GDataTransferWrapper;
