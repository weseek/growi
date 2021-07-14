import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AdminSocketIoContainer from '~/client/js/services/AdminSocketIoContainer';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';

import StatusTable from '~/client/js/components/Admin/ElasticsearchManagement/StatusTable';
import ReconnectControls from '~/client/js/components/Admin/ElasticsearchManagement/ReconnectControls';
import NormalizeIndicesControls from '~/client/js/components/Admin/ElasticsearchManagement/NormalizeIndicesControls';
import RebuildIndexControls from '~/client/js/components/Admin/ElasticsearchManagement/RebuildIndexControls';
import { apiv3Get, apiv3Post, apiv3Put } from '~/utils/apiv3-client';

const ElasticsearchManagement = (props) => {
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isReconnectingProcessing, setIsReconnectingProcessing] = useState(false)
  const [isRebuildingProcessing, setIsRebuildingProcessing] = useState(false)
  const [isRebuildingCompleted, setIsRebuildingCompleted] = useState(false)

  const [isNormalized, setIsNormalized] = useState(null)
  const [indicesData, setIndicesData] = useState(null)
  const [aliasesData, setAliasesData] = useState(null)


  useEffect(() => {
    retrieveIndicesStatus()
  }, [])

  useEffect(() => {
    initWebSockets();
  }, [])

  const initWebSockets = () => {
    const socket = props.adminSocketIoContainer.getSocket();

    socket.on('addPageProgress', (data) => {
      setIsRebuildingProcessing(true);
    });

    socket.on('finishAddPage', (data) => {
      setIsRebuildingProcessing(false)
      setIsRebuildingCompleted(true)

    });

    socket.on('rebuildingFailed', (data) => {
      toastError(new Error(data.error), 'Rebuilding Index has failed.');
    });
  }

  const retrieveIndicesStatus = async () => {
    try {
      const { info } = await apiv3Get('/search/indices');
      setIsConnected(true);
      setIsConfigured(true);
      setIndicesData(info.indices);
      setAliasesData(info.aliases);
      setIsNormalized(info.isNormalized);
    }
    catch (errors) {
      setIsConnected(false);

      // evaluate whether configured or not
      for (const error of errors) {
        if (error.code === 'search-service-unconfigured') {
          setIsConfigured(false);
        }
      }

      toastError(errors);
    }
    finally {
      setIsInitialized(true);
    }
  }

  const reconnect = async () => {
    setIsReconnectingProcessing(true);

    try {
      await apiv3Post('/search/connection');
    }
    catch (e) {
      toastError(e);
      return;
    }

    // reload
    window.location.reload();
  }

  const normalizeIndices = async () => {
    try {
      await apiv3Put('/search/indices', { operation: 'normalize' });
    }
    catch (e) {
      toastError(e);
    }

    await retrieveIndicesStatus();

    toastSuccess('Normalizing has succeeded');
  }

  const rebuildIndices = async () => {
    setIsRebuildingProcessing(true);

    try {
      await apiv3Put('/search/indices', { operation: 'rebuild' });
      toastSuccess('Rebuilding is requested');
    }
    catch (e) {
      toastError(e);
    }

    await retrieveIndicesStatus();
  }

  // TODO: GW- retrieve from SWR
  // const isErrorOccuredOnSearchService = !appContainer.config.isSearchServiceReachable;
  const isErrorOccuredOnSearchService = true;

  const isReconnectBtnEnabled = !isReconnectingProcessing && (!isInitialized || !isConnected || isErrorOccuredOnSearchService);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <StatusTable
            isInitialized={isInitialized}
            isErrorOccuredOnSearchService={isErrorOccuredOnSearchService}
            isConnected={isConnected}
            isConfigured={isConfigured}
            isNormalized={isNormalized}
            indicesData={indicesData}
            aliasesData={aliasesData}
          />
        </div>
      </div>

      <hr />

      {/* Controls */}
      <div className="row">
        <label className="col-md-3 col-form-label text-left text-md-right">{t('full_text_search_management.reconnect')}</label>
        <div className="col-md-6">
          <ReconnectControls
            isEnabled={isReconnectBtnEnabled}
            isProcessing={isReconnectingProcessing}
            onReconnectingRequested={reconnect}
          />
        </div>
      </div>

      <hr />

      <div className="row">
        <label className="col-md-3 col-form-label text-left text-md-right">{t('full_text_search_management.normalize')}</label>
        <div className="col-md-6">
          <NormalizeIndicesControls
            isRebuildingProcessing={isRebuildingProcessing}
            isRebuildingCompleted={isRebuildingCompleted}
            isNormalized={isNormalized}
            onNormalizingRequested={normalizeIndices}
          />
        </div>
      </div>

      <hr />

      <div className="row">
        <label className="col-md-3 col-form-label text-left text-md-right">{t('full_text_search_management.rebuild')}</label>
        <div className="col-md-6">
          <RebuildIndexControls
            isRebuildingProcessing={isRebuildingProcessing}
            isRebuildingCompleted={isRebuildingCompleted}
            isNormalized={isNormalized}
            onRebuildingRequested={rebuildIndices}
          />
        </div>
      </div>

    </>
  )
}

export default ElasticsearchManagement
