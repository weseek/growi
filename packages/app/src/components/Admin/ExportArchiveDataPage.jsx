import React, {
  useCallback, useEffect, useState,
} from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import AdminSocketIoContainer from '~/client/services/AdminSocketIoContainer';
import { apiDelete, apiGet } from '~/client/util/apiv1-client';

import { withUnstatedContainers } from '../UnstatedUtils';

import LabeledProgressBar from './Common/LabeledProgressBar';
import ArchiveFilesTable from './ExportArchiveData/ArchiveFilesTable';
import SelectCollectionsModal from './ExportArchiveData/SelectCollectionsModal';


const IGNORED_COLLECTION_NAMES = [
  'sessions', 'rlflx', 'activities',
];

const ExportArchiveDataPage = (props) => {

  const [collections, setCollections] = useState([]);
  const [zipFileStats, setZipFileStats] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isExported, setIsExported] = useState(false);

  const { t } = useTranslation();

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
  }, []);

  const cleanupWebsocketEventHandler = useCallback(() => {
    const socket = props.adminSocketIoContainer.getSocket();
    if (socket == null) {
      return;
    }
    // websocket event
    socket.on('admin:onProgressForExport', () => {
      setIsExporting(false);
      setProgressList([]);
    });

    // websocket event
    socket.on('admin:onStartZippingForExport', () => {
      setIsZipping(false);
    });

    // websocket event
    socket.on('admin:onTerminateForExport', () => {
      setIsExporting(true);
      setIsZipping(true);
      setIsExported(false);
      setZipFileStats([]);
    });
  }, [props.adminSocketIoContainer]);

  const setupWebsocketEventHandler = useCallback(() => {

    const socket = props.adminSocketIoContainer.getSocket();
    console.log(socket);
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
  adminSocketIoContainer: PropTypes.instanceOf(AdminSocketIoContainer).isRequired,
};

const ExportArchiveDataPageWrapperFC = (props) => {
  return <ExportArchiveDataPage {...props} />;
};
/**
 * Wrapper component for using unstated
 */
const ExportArchiveDataPageWrapper = withUnstatedContainers(ExportArchiveDataPageWrapperFC, [AdminSocketIoContainer]);
export default ExportArchiveDataPageWrapper;
