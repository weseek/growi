import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminSocketIoContainer from '../../../services/AdminSocketIoContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import StatusTable from './StatusTable';
import ReconnectControls from './ReconnectControls';
import NormalizeIndicesControls from './NormalizeIndicesControls';
import RebuildIndexControls from './RebuildIndexControls';

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

  async componentWillMount() {
    this.retrieveIndicesStatus();
  }

  componentDidMount() {
    this.initWebSockets();
  }

  initWebSockets() {
    const socket = this.props.adminSocketIoContainer.getSocket();

    socket.on('admin:addPageProgress', (data) => {
      this.setState({
        isRebuildingProcessing: true,
      });
    });

    socket.on('admin:finishAddPage', (data) => {
      this.setState({
        isRebuildingProcessing: false,
        isRebuildingCompleted: true,
      });
    });

    socket.on('admin:rebuildingFailed', (data) => {
      toastError(new Error(data.error), 'Rebuilding Index has failed.');
    });
  }

  async retrieveIndicesStatus() {
    const { appContainer } = this.props;

    try {
      const { info } = await appContainer.apiv3Get('/search/indices');

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
    const { appContainer } = this.props;

    this.setState({ isReconnectingProcessing: true });

    try {
      await appContainer.apiv3Post('/search/connection');
    }
    catch (e) {
      toastError(e);
      return;
    }

    // reload
    window.location.reload();
  }

  async normalizeIndices() {
    const { appContainer } = this.props;

    try {
      await appContainer.apiv3Put('/search/indices', { operation: 'normalize' });
    }
    catch (e) {
      toastError(e);
    }

    await this.retrieveIndicesStatus();

    toastSuccess('Normalizing has succeeded');
  }

  async rebuildIndices() {
    const { appContainer } = this.props;

    this.setState({ isRebuildingProcessing: true });

    try {
      await appContainer.apiv3Put('/search/indices', { operation: 'rebuild' });
      toastSuccess('Rebuilding is requested');
    }
    catch (e) {
      toastError(e);
    }

    await this.retrieveIndicesStatus();
  }

  render() {
    const { t, appContainer } = this.props;
    const {
      isInitialized,
      isConnected, isConfigured, isReconnectingProcessing, isRebuildingProcessing, isRebuildingCompleted,
      isNormalized, indicesData, aliasesData,
    } = this.state;

    const isErrorOccuredOnSearchService = !appContainer.config.isSearchServiceReachable;

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

/**
 * Wrapper component for using unstated
 */
const ElasticsearchManagementWrapper = withUnstatedContainers(ElasticsearchManagement, [AppContainer, AdminSocketIoContainer]);

ElasticsearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminSocketIoContainer: PropTypes.instanceOf(AdminSocketIoContainer).isRequired,
};

export default withTranslation()(ElasticsearchManagementWrapper);
