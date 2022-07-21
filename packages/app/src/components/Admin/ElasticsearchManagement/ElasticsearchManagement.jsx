import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';


import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Get, apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import { useIsSearchServiceReachable } from '~/stores/context';
import { useAdminSocket } from '~/stores/socket-io';

import NormalizeIndicesControls from './NormalizeIndicesControls';
import RebuildIndexControls from './RebuildIndexControls';
import ReconnectControls from './ReconnectControls';
import StatusTable from './StatusTable';

class ElasticsearchManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isInitialized: false,

      isConnected: false,
      isConfigured: false,
      isReconnectingProcessing: false,
      isRebuildingProcessing: false,
      isRebuildingCompleted: false,

      isNormalized: null,
      indicesData: null,
      aliasesData: null,
    };

    this.reconnect = this.reconnect.bind(this);
    this.normalizeIndices = this.normalizeIndices.bind(this);
    this.rebuildIndices = this.rebuildIndices.bind(this);
  }

  async UNSAFE_UNSAFE_componentWillMount() {
    this.retrieveIndicesStatus();
  }

  componentDidMount() {
    this.initWebSockets();
  }

  initWebSockets() {
    const { socket } = this.props;

    if (socket != null) {
      socket.on('addPageProgress', (data) => {
        this.setState({
          isRebuildingProcessing: true,
        });
      });

      socket.on('finishAddPage', async(data) => {
        await this.retrieveIndicesStatus();
        this.setState({
          isRebuildingProcessing: false,
          isRebuildingCompleted: true,
        });
      });

      socket.on('rebuildingFailed', (data) => {
        toastError(new Error(data.error), 'Rebuilding Index has failed.');
      });
    }

  }

  async retrieveIndicesStatus() {
    try {
      const { data } = await apiv3Get('/search/indices');
      const { info } = data;

      this.setState({
        isConnected: true,
        isConfigured: true,

        indicesData: info.indices,
        aliasesData: info.aliases,
        isNormalized: info.isNormalized,
      });
    }
    catch (errors) {
      this.setState({ isConnected: false });

      // evaluate whether configured or not
      for (const error of errors) {
        if (error.code === 'search-service-unconfigured') {
          this.setState({ isConfigured: false });
        }
      }

      toastError(errors);
    }
    finally {
      this.setState({ isInitialized: true });
    }
  }

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

    await this.retrieveIndicesStatus();

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

    await this.retrieveIndicesStatus();
  }

  render() {
    const { t, isSearchServiceReachable } = this.props;
    const {
      isInitialized,
      isConnected, isConfigured, isReconnectingProcessing, isRebuildingProcessing, isRebuildingCompleted,
      isNormalized, indicesData, aliasesData,
    } = this.state;

    const isErrorOccuredOnSearchService = !isSearchServiceReachable;

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
          <label className="col-md-3 col-form-label text-left text-md-right">{ t('full_text_search_management.reconnect') }</label>
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
          <label className="col-md-3 col-form-label text-left text-md-right">{ t('full_text_search_management.normalize') }</label>
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
          <label className="col-md-3 col-form-label text-left text-md-right">{ t('full_text_search_management.rebuild') }</label>
          <div className="col-md-6">
            <RebuildIndexControls
              isRebuildingProcessing={isRebuildingProcessing}
              isRebuildingCompleted={isRebuildingCompleted}
              isNormalized={isNormalized}
              onRebuildingRequested={this.rebuildIndices}
            />
          </div>
        </div>

      </>
    );
  }

}

const ElasticsearchManagementWrapperFC = (props) => {
  const { t } = useTranslation();
  const { data: isSearchServiceReachable } = useIsSearchServiceReachable();
  const { data: socket } = useAdminSocket();

  // if (isSearchServiceReachable == null) {
  //   return <></>;
  // }

  return <ElasticsearchManagement t={t} isSearchServiceReachable={isSearchServiceReachable} socket={socket} {...props} />;
};


ElasticsearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  isSearchServiceReachable: PropTypes.bool,
  socket: PropTypes.object,
};

export default ElasticsearchManagementWrapperFC;
