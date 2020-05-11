import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

class StatusTable extends React.PureComponent {

  renderPreInitializedLabel() {
    return <span className="label label-default">――</span>;
  }

  renderConnectionStatusLabels() {
    const { t } = this.props;
    const {
      isErrorOccuredOnSearchService,
      isConnected, isConfigured,
    } = this.props;

    const errorOccuredLabel = isErrorOccuredOnSearchService
      ? <span className="label label-danger ml-2">{ t('full_text_search_management.connection_status_label_erroroccured') }</span>
      : null;

    let connectionStatusLabel = null;
    if (!isConfigured) {
      connectionStatusLabel = <span className="label label-default">{ t('full_text_search_management.connection_status_label_unconfigured') }</span>;
    }
    else {
      connectionStatusLabel = isConnected
        ? <span className="label label-success">{ t('full_text_search_management.connection_status_label_connected') }</span>
        : <span className="label label-danger">{ t('full_text_search_management.connection_status_label_disconnected') }</span>;
    }

    return (
      <>
        {connectionStatusLabel}{errorOccuredLabel}
      </>
    );
  }

  renderIndicesStatusLabel() {
    const { t, isNormalized } = this.props;

    return isNormalized
      ? <span className="label label-info">{ t('full_text_search_management.indices_status_label_normalized') }</span>
      : <span className="label label-warning">{ t('full_text_search_management.indices_status_label_unnormalized') }</span>;
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
    } = this.props;

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

  render() {
    const { t } = this.props;
    const {
      isInitialized,
    } = this.props;

    return (
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>{ t('full_text_search_management.connection_status') }</th>
            <td>
              { isInitialized ? this.renderConnectionStatusLabels() : this.renderPreInitializedLabel() }
            </td>
          </tr>
          <tr>
            <th>{ t('full_text_search_management.indices_status') }</th>
            <td>
              { isInitialized ? this.renderIndicesStatusLabel() : this.renderPreInitializedLabel() }
            </td>
          </tr>
          <tr>
            <th className="col-sm-4">{ t('full_text_search_management.indices_summary') }</th>
            <td className="p-4">
              { isInitialized && this.renderIndexInfoPanels() }
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const StatusTableWrapper = (props) => {
  return createSubscribedElement(StatusTable, props, []);
};

StatusTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isInitialized: PropTypes.bool,
  isErrorOccuredOnSearchService: PropTypes.bool,

  isConnected: PropTypes.bool,
  isConfigured: PropTypes.bool,
  isNormalized: PropTypes.bool,
  indicesData: PropTypes.object,
  aliasesData: PropTypes.object,
};

export default withTranslation()(StatusTableWrapper);
