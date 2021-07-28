import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useSearchIndicesInfoSWR } from '~/stores/search';
// TODO: GW-5134 Migrate SocketIoContainer to SWR
// TODO: GW-6816 Add SocketIo to ElasticsearchManagement
// import AdminSocketIoContainer from '../../../services/AdminSocketIoContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import StatusTable from './StatusTable';
import ReconnectControls from './ReconnectControls';
import NormalizeIndicesControls from './NormalizeIndicesControls';
// import RebuildIndexControls from './RebuildIndexControls';
import { apiv3Post, apiv3Put } from '~/utils/apiv3-client';

class ElasticsearchManagementBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isReconnectingProcessing: false,
      isRebuildingProcessing: false,
      isRebuildingCompleted: false,
    };

    this.reconnect = this.reconnect.bind(this);
    this.normalizeIndices = this.normalizeIndices.bind(this);
    this.rebuildIndices = this.rebuildIndices.bind(this);
  }

  // TODO: GW-5134 Migrate SocketIoContainer to SWR
  // TODO: GW-6816 Add SocketIo to ElasticsearchManagement
  // initWebSockets() {
  //   const socket = this.props.adminSocketIoContainer.getSocket();

  //   socket.on('addPageProgress', (data) => {
  //     this.setState({
  //       isRebuildingProcessing: true,
  //     });
  //   });

  //   socket.on('finishAddPage', (data) => {
  //     this.setState({
  //       isRebuildingProcessing: false,
  //       isRebuildingCompleted: true,
  //     });
  //   });

  //   socket.on('rebuildingFailed', (data) => {
  //     toastError(new Error(data.error), 'Rebuilding Index has failed.');
  //   });
  // }

  async reconnect() {
    this.setState({ isReconnectingProcessing: true });

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

  async normalizeIndices() {
    try {
      await apiv3Put('/search/indices', { operation: 'normalize' });
    }
    catch (e) {
      toastError(e);
    }

    await this.props.onUpdateIndices();

    toastSuccess('Normalizing has succeeded');
  }

  async rebuildIndices() {
    this.setState({ isRebuildingProcessing: true });

    try {
      await apiv3Put('/search/indices', { operation: 'rebuild' });
      toastSuccess('Rebuilding is requested');
    }
    catch (e) {
      toastError(e);
    }

    await this.props.onUpdateIndices();
  }

  render() {
    const { t, isInitialized, isConnected, isConfigured, isNormalized, indicesData, aliasesData } = this.props;
    const { isReconnectingProcessing, isRebuildingProcessing, isRebuildingCompleted } = this.state;

    // TODO: GW-6857 retrieve from SWR
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

        <div className="row">
          <label className="col-md-3 col-form-label text-left text-md-right">{t('full_text_search_management.reconnect')}</label>
          <div className="col-md-6">
            <ReconnectControls
              isEnabled={isReconnectBtnEnabled}
              isProcessing={isReconnectingProcessing}
              onReconnectingRequested={this.reconnect}
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
              onNormalizingRequested={this.normalizeIndices}
            />
          </div>
        </div>

        <hr />

        <div className="row">
          <label className="col-md-3 col-form-label text-left text-md-right">{t('full_text_search_management.rebuild')}</label>
          <div className="col-md-6">
            {/* TODO: GW-5134 Migrate SocketIoContainer to SWR */}
            {/* <RebuildIndexControls
              isRebuildingProcessing={isRebuildingProcessing}
              isRebuildingCompleted={isRebuildingCompleted}
              isNormalized={isNormalized}
              onRebuildingRequested={this.rebuildIndices}
            /> */}
          </div>
        </div>
      </>
    );
  }
}

export default function ElasticsearchManagement() {
  const { t } = useTranslation();
  // TODO: GW-6857 retrieve isErrorOccuredOnSearchService from SWR

  let isConfigured = false;
  let isConnected = false;
  let isInitialized = false;
  let isNormalized = false;
  let indicesData = {};
  let aliasesData = {};

  const { data, error, isValidating, mutate } = useSearchIndicesInfoSWR();

  if (data?.info != null) {
    indicesData = data.info.indices;
    aliasesData = data.info.aliases;
    isNormalized = data.info.isNormalized;
    isConfigured = true
    isConnected = true;
    isInitialized = true;

  }

  if (error != null) {
    isConnected = false;
    isConfigured = error.isConfigured;
  }

  if (isValidating) {
    isInitialized = false;
  }

  return (
    <ElasticsearchManagementBody
      indicesData={indicesData}
      aliasesData={aliasesData}
      isNormalized={isNormalized}
      onUpdateIndices={mutate}
      t={t}
      isInitialized={isInitialized}
      isConnected={isConnected}
      isConfigured={isConfigured}
    />
  );
}
