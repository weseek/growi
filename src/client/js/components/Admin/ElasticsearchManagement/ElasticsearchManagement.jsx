import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import StatusTable from './StatusTable';
import ReconnectControls from './ReconnectControls';
import NormalizeIndicesControls from './NormalizeIndicesControls';
import RebuildIndexControls from './RebuildIndexControls';

class ElasticsearchManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isConfigured: null,
      isConnected: null,
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
    const socket = this.props.websocketContainer.getWebSocket();

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
        isConfigured: true,
        isConnected: true,

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
  }

  async reconnect() {
    const { appContainer } = this.props;

    try {
      await appContainer.apiv3Post('/search/connection');
      toastSuccess('Reconnecting to Elasticsearch has succeeded');
    }
    catch (e) {
      toastError(e);
      return;
    }

    await this.retrieveIndicesStatus();
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
    const { t } = this.props;
    const {
      isConfigured, isConnected, isRebuildingProcessing, isRebuildingCompleted,
      isNormalized, indicesData, aliasesData,
    } = this.state;

    return (
      <>
        <div className="row">
          <div className="col-xs-12">
            <StatusTable
              isConfigured={isConfigured}
              isConnected={isConnected}
              isNormalized={isNormalized}
              indicesData={indicesData}
              aliasesData={aliasesData}
            />
          </div>
        </div>

        <hr />

        {/* Controls */}
        <div className="row">
          <label className="col-xs-3 control-label">{ t('full_text_search_management.reconnect') }</label>
          <div className="col-xs-6">
            <ReconnectControls
              isConfigured={isConfigured}
              isConnected={isConnected}
              onReconnectingRequested={this.reconnect}
            />
          </div>
        </div>

        <hr />

        <div className="row">
          <label className="col-xs-3 control-label">{ t('full_text_search_management.normalize') }</label>
          <div className="col-xs-6">
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
          <label className="col-xs-3 control-label">{ t('full_text_search_management.rebuild') }</label>
          <div className="col-xs-6">
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
const ElasticsearchManagementWrapper = (props) => {
  return createSubscribedElement(ElasticsearchManagement, props, [AppContainer, WebsocketContainer]);
};

ElasticsearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,
};

export default withTranslation()(ElasticsearchManagementWrapper);
