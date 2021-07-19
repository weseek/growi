import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// import { withUnstatedContainers } from '../../UnstatedUtils';
import { useIndicesSWR } from '~/stores/search';
// TODO: GW-5134 SocketIoContainer 機能の swr 化
// TODO: GW-6816 [5134ブロック] ElasticsearchManagementにSocketIoを追加する
// import AdminSocketIoContainer from '../../../services/AdminSocketIoContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import StatusTable from './StatusTable';
import ReconnectControls from './ReconnectControls';
import NormalizeIndicesControls from './NormalizeIndicesControls';
import RebuildIndexControls from './RebuildIndexControls';
import { apiv3Post, apiv3Put } from '~/utils/apiv3-client';

class ElasticsearchManagementBody extends React.Component {
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

  // componentDidMount() {
  //   this.initWebSockets();
  // }

  // TODO: GW-5134 SocketIoContainer 機能の swr 化
  // TODO: GW-6816 [5134ブロック] ElasticsearchManagementにSocketIoを追加する
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
    } catch (e) {
      toastError(e);
      return;
    }

    // reload
    window.location.reload();
  }

  async normalizeIndices() {
    try {
      await apiv3Put('/search/indices', { operation: 'normalize' });
    } catch (e) {
      toastError(e);
    }

    await this.props.mutate();

    toastSuccess('Normalizing has succeeded');
  }

  async rebuildIndices() {
    this.setState({ isRebuildingProcessing: true });

    try {
      await apiv3Put('/search/indices', { operation: 'rebuild' });
      toastSuccess('Rebuilding is requested');
    } catch (e) {
      toastError(e);
    }

    await this.props.mutate();
  }

  render() {
    const { t } = this.props;
    const { isReconnectingProcessing, isRebuildingProcessing, isRebuildingCompleted } = this.state;
    const { isNormalized, indices, aliases } = this.props.data.info;
    const { isInitialized, isConnected, isConfigured } = this.props.status;

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
              indicesData={indices}
              aliasesData={aliases}
            />
          </div>
        </div>

        <hr />

        <div className="row">
          <label className="col-md-3 col-form-label text-left text-md-right">{t('full_text_search_management.reconnect')}</label>
          <div className="col-md-6">
            <ReconnectControls isEnabled={isReconnectBtnEnabled} isProcessing={isReconnectingProcessing} onReconnectingRequested={this.reconnect} />
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

export default function ElasticsearchManagement() {
  const { t } = useTranslation();
  const status = {
    isInitialized: true,
    isConnected: true,
    isConfigured: true,
  };
  const { data, isValidating, error, mutate } = useIndicesSWR();
  return <>{data != null && t != null && <ElasticsearchManagementBody data={data} mutate={mutate} t={t} status={status} />}</>;
}
