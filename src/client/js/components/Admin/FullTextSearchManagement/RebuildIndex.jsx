import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import ProgressBar from '../Common/ProgressBar';

class RebuildIndex extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isNormalized: undefined,
      indicesData: null,
      aliasesData: null,

      isProcessing: false,
      isCompleted: false,

      total: 0,
      current: 0,
      skip: 0,
    };

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
        isProcessing: true,
        ...data,
      });
    });

    socket.on('admin:finishAddPage', (data) => {
      this.setState({
        isProcessing: false,
        isCompleted: true,
        ...data,
      });
    });
  }

  async retrieveIndicesStatus() {
    const { appContainer } = this.props;

    try {
      const { info } = await appContainer.apiv3Get('/search/indices');

      this.setState({
        indicesData: info.indices,
        aliasesData: info.aliases,
        isNormalized: info.isNormalized,
      });
    }
    catch (e) {
      toastError(e);
    }
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

    try {
      await appContainer.apiv3Put('/search/indices', { operation: 'rebuild' });

      this.setState({ isProcessing: true });
      toastSuccess('Rebuilding is requested');
    }
    catch (e) {
      toastError(e);
    }
  }

  renderIndexInfoPanel(indexName, body = {}, aliases = []) {
    const collapseId = `collapse-${indexName}`;

    const aliasLabels = aliases.map((aliasName) => {
      return (
        <span key={`label-${indexName}-${aliasName}`} className="label label-primary mr-2">
          <i className="icon-tag"></i> {aliasName}
        </span>
      );
    });

    return (
      <div className="panel panel-default">
        <div className="panel-heading" role="tab">
          <h4 className="panel-title">
            <a role="button" data-toggle="collapse" data-parent="#accordion" href={`#${collapseId}`} aria-expanded="true" aria-controls={collapseId}>
              <i className="fa fa-fw fa-database"></i> {indexName}
            </a>
            <span className="ml-3">{aliasLabels}</span>
          </h4>
        </div>
        <div id={collapseId} className="panel-collapse collapse" role="tabpanel">
          <div className="panel-body">
            <pre>
              {JSON.stringify(body, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  renderIndexInfoPanels() {
    const {
      indicesData,
      aliasesData,
    } = this.state;

    // data is null
    if (indicesData == null) {
      return null;
    }

    /*
      "indices": {
        "growi": {
          ...
        }
      },
    */
    const indexNameToDataMap = {};
    for (const [indexName, indexData] of Object.entries(indicesData)) {
      indexNameToDataMap[indexName] = indexData;
    }

    // no indices
    if (indexNameToDataMap.length === 0) {
      return null;
    }

    /*
      "aliases": {
        "growi": {
          "aliases": {
            "growi-alias": {}
          }
        }
      },
    */
    const indexNameToAliasMap = {};
    for (const [indexName, aliasData] of Object.entries(aliasesData)) {
      indexNameToAliasMap[indexName] = Object.keys(aliasData.aliases);
    }

    return (
      <div className="row">
        { Object.keys(indexNameToDataMap).map((indexName) => {
          return (
            <div key={`col-${indexName}`} className="col-xs-6">
              { this.renderIndexInfoPanel(indexName, indexNameToDataMap[indexName], indexNameToAliasMap[indexName]) }
            </div>
          );
        }) }
      </div>
    );
  }

  renderProgressBar() {
    const {
      total, current, skip, isProcessing, isCompleted,
    } = this.state;
    const showProgressBar = isProcessing || isCompleted;

    if (!showProgressBar) {
      return null;
    }

    const header = isCompleted ? 'Completed' : `Processing.. (${skip} skips)`;

    return (
      <ProgressBar
        header={header}
        currentCount={current}
        totalCount={total}
      />
    );
  }

  renderNormalizeControls() {
    const { t } = this.props;

    const isEnabled = !this.state.isNormalized && !this.state.isProcessing;

    return (
      <>
        <button
          type="submit"
          className={`btn btn-outline ${isEnabled ? 'btn-info' : 'btn-default'}`}
          onClick={this.normalizeIndices}
          disabled={!isEnabled}
        >
          { t('full_text_search_management.normalize_button') }
        </button>

        <p className="help-block">
          { t('full_text_search_management.normalize_description') }<br />
        </p>
      </>
    );
  }

  renderRebuildControls() {
    const { t } = this.props;

    const isEnabled = this.state.isNormalized && !this.state.isProcessing;

    return (
      <>
        { this.renderProgressBar() }

        <button
          type="submit"
          className="btn btn-inverse"
          onClick={this.rebuildIndices}
          disabled={!isEnabled}
        >
          { t('full_text_search_management.rebuild_button') }
        </button>

        <p className="help-block">
          { t('full_text_search_management.rebuild_description_1') }<br />
          { t('full_text_search_management.rebuild_description_2') }<br />
        </p>
      </>
    );
  }


  render() {
    const { t } = this.props;
    const { isNormalized } = this.state;

    let statusLabel = <span className="label label-default">――</span>;
    if (isNormalized != null) {
      statusLabel = isNormalized
        ? <span className="label label-info">{ t('full_text_search_management.indices_status_label_normalized') }</span>
        : <span className="label label-warning">{ t('full_text_search_management.indices_status_label_unnormalized') }</span>;
    }

    return (
      <>
        <div className="row">
          <div className="col-xs-12">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th>{ t('full_text_search_management.indices_status') }</th>
                  <td>{statusLabel}</td>
                </tr>
                <tr>
                  <th className="col-sm-4">{ t('full_text_search_management.indices_summary') }</th>
                  <td className="p-4">
                    { this.renderIndexInfoPanels() }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr />

        {/* Controls */}
        <div className="row">
          <label className="col-xs-3 control-label">{ t('full_text_search_management.normalize') }</label>
          <div className="col-xs-6">
            { this.renderNormalizeControls() }
          </div>
        </div>

        <hr />

        <div className="row">
          <label className="col-xs-3 control-label">{ t('full_text_search_management.rebuild') }</label>
          <div className="col-xs-6">
            { this.renderRebuildControls() }
          </div>
        </div>

      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const RebuildIndexWrapper = (props) => {
  return createSubscribedElement(RebuildIndex, props, [AppContainer, WebsocketContainer]);
};

RebuildIndex.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,
};

export default withTranslation()(RebuildIndexWrapper);
