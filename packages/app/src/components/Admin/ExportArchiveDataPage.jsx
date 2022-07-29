import React, {
  useCallback, useEffect, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import useSWR from 'swr';
import * as toastr from 'toastr';

import AdminSocketIoContainer from '~/client/services/AdminSocketIoContainer';
import AppContainer from '~/client/services/AppContainer';
import { apiDelete, apiGet } from '~/client/util/apiv1-client';

import { withUnstatedContainers } from '../UnstatedUtils';

import LabeledProgressBar from './Common/LabeledProgressBar';
import ArchiveFilesTable from './ExportArchiveData/ArchiveFilesTable';
import SelectCollectionsModal from './ExportArchiveData/SelectCollectionsModal';


const IGNORED_COLLECTION_NAMES = [
  'sessions', 'rlflx', 'activities',
];

const ExportArchiveDataPage = (props) => {

  // anyで指定した箇所もっと具体的に指定
  const [collections, setCollections] = useState([]);
  const [zipFileStats, setZipFileStats] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isExported, setIsExported] = useState(false);

  const { t } = useTranslation();

  // Keigo-h will use in https://redmine.weseek.co.jp/issues/101571
  // const { data: collectionsData } = useSWR('/v3/mongo/collections', (endpoint => apiGet(endpoint, {})));
  // const { data: statusData } = useSWR('/v3/export/status', (endpoint => apiGet(endpoint, {})));

  const fetchData = useCallback(async() => {
    const [{ collections }, { status }] = await Promise.all([
      apiGet('/v3/mongo/collections', {}),
      apiGet('/v3/export/status', {}),
    ]);
    const filteredCollections = collections.filter((collectionName) => {
      return !IGNORED_COLLECTION_NAMES.includes(collectionName);
    });
    const { zipFileStats, isExporting, progressList } = status;
    setCollections(filteredCollections);
    setZipFileStats(zipFileStats);
    setIsExporting(isExporting);
    setProgressList(progressList);
    // Keigo-h will use in https://redmine.weseek.co.jp/issues/101571
    // if (collectionsData != null) {
    //   console.log(`dataの値: ${JSON.stringify(collectionsData)}`);
    //   const filteredCollections = collectionsData.collections.filter((collectionName) => {
    //     return !IGNORED_COLLECTION_NAMES.includes(collectionName);
    //   });
    //   setCollections(filteredCollections);
    // }

    // if (statusData != null) {
    //   const { zipFileStats, isExporting, progressList } = statusData.status;
    //   setZipFileStats(zipFileStats);
    //   setIsExporting(isExporting);
    //   setProgressList(progressList);
    // }
  }, []);

  const cleanupWebsocketEventHandler = useCallback(() => {
    const socket = props.adminSocketIoContainer.getSocket();
    if (socket == null) {
      return;
    }
    socket.off('admin:onProgressForExport');

    socket.off('admin:onStartZippingForExport');

    socket.off('admin:onTerminateForExport');
  }, [props.adminSocketIoContainer]);

  const setupWebsocketEventHandler = useCallback(() => {

    const socket = props.adminSocketIoContainer.getSocket();
    if (socket == null) {
      return;
    }
    // websocket event
    socket.on('admin:onProgressForExport', ({ currentCount, totalCount, progressListOpt }) => {
      setIsExporting(true);
      setProgressList(progressListOpt);
    });

    // websocket event
    socket.on('admin:onStartZippingForExport', () => {
      setIsZipping(true);
    });

    // websocket event
    socket.on('admin:onTerminateForExport', ({ addedZipFileStat }) => {
      setIsExporting(false);
      setIsZipping(false);
      setIsExported(true);
      setZipFileStats(prev => [...prev, addedZipFileStat]);

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
  }, [props.adminSocketIoContainer]);

  const onZipFileStatRemove = useCallback(async(fileName) => {
    try {
      await apiDelete(`/v3/export/${fileName}`, {});

      setZipFileStats(zipFileStats.filter(stat => stat.fileName !== fileName));

      // TODO: toastSuccess, toastError
      toastr.success(undefined, `Deleted ${fileName}`, {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
    }
    catch (err) {
      // TODO: toastSuccess, toastError
      toastr.error(err, 'Error', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '3000',
      });
    }
  }, [zipFileStats]);

  const openExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);


  const closeExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  /**
   * event handler invoked when export process was requested successfully
   */
  const exportingRequestedHandler = useCallback(() => {
  }, []);

  const renderProgressBarsForCollections = useCallback(() => {
    const cols = progressList.map((progressData) => {
      const { collectionName, currentCount, totalCount } = progressData;
      return (
        <div className="col-md-6" key={collectionName}>
          <LabeledProgressBar
            header={collectionName}
            currentCount={currentCount}
            totalCount={totalCount}
          />
        </div>
      );
    });

    return <div className="row px-3">{cols}</div>;
  }, [progressList]);

  const renderProgressBarForZipping = useCallback(() => {
    const showZippingBar = isZipping || isExported;

    if (!showZippingBar) {
      return <></>;
    }

    return (
      <div className="row px-3">
        <div className="col-md-12" key="progressBarForZipping">
          <LabeledProgressBar
            header="Zip Files"
            currentCount={1}
            totalCount={1}
            isInProgress={isZipping}
          />
        </div>
      </div>
    );
  }, [isZipping, isExported]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setupWebsocketEventHandler();
    return () => {
      cleanupWebsocketEventHandler();
    };
  }, [setupWebsocketEventHandler, cleanupWebsocketEventHandler]);

  const showExportingData = (isExported || isExporting) && (progressList != null);

  return (
    <div data-testid="admin-export-archive-data">
      <h2>{t('Export Archive Data')}</h2>

      <button type="button" className="btn btn-outline-secondary" disabled={isExporting} onClick={() => openExportModal()}>
        {t('admin:export_management.create_new_archive_data')}
      </button>

      { showExportingData && (
        <div className="mt-5">
          <h3>{t('admin:export_management.exporting_collection_list')}</h3>
          {renderProgressBarsForCollections() }
          {renderProgressBarForZipping() }
        </div>
      ) }

      <div className="mt-5">
        <h3>{t('admin:export_management.exported_data_list')}</h3>
        <ArchiveFilesTable
          zipFileStats={zipFileStats}
          onZipFileStatRemove={(fileName => onZipFileStatRemove(fileName))}
        />
      </div>

      <SelectCollectionsModal
        isOpen={isExportModalOpen}
        onExportingRequested={() => exportingRequestedHandler()}
        onClose={() => closeExportModal()}
        collections={collections}
      />
    </div>
  );

};

ExportArchiveDataPage.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminSocketIoContainer: PropTypes.instanceOf(AdminSocketIoContainer).isRequired,
};

const ExportArchiveDataPageWrapper = withUnstatedContainers(ExportArchiveDataPage, [AppContainer, AdminSocketIoContainer]);
export default ExportArchiveDataPageWrapper;
