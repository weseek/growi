import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

class StatusTable extends React.PureComponent {

  renderIndexInfoPanel(indexName, body = {}, aliases = []) {
    const collapseId = `collapse-${indexName}`;

    const aliasLabels = aliases.map((aliasName) => {
      return (
        <span key={`badge-${indexName}-${aliasName}`} className="badge badge-pill badge-primary mr-2">
          <i className="icon-tag"></i> {aliasName}
        </span>
      );
    });

    return (
      <div className="card">
        <div className="card-header">
          <a role="button" data-toggle="collapse" href={`#${collapseId}`} aria-expanded="true" aria-controls={collapseId}>
            <i className="fa fa-fw fa-database"></i> {indexName}
          </a>
          <span className="ml-3">{aliasLabels}</span>
        </div>
        <div id={collapseId} className="collapse">
          <div className="card-body">
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
            <div key={`col-${indexName}`} className="col-6">
              { this.renderIndexInfoPanel(indexName, indexNameToDataMap[indexName], indexNameToAliasMap[indexName]) }
            </div>
          );
        }) }
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { isConfigured, isConnected, isNormalized } = this.props;


    let connectionStatusLabel = <span className="badge badge-pill badge-secondary">――</span>;
    if (isConfigured != null && !isConfigured) {
      connectionStatusLabel = <span className="badge badge-pill badge-secondary">{t('full_text_search_management.connection_status_label_unconfigured')}</span>;
    }
    else if (isConnected != null) {
      connectionStatusLabel = isConnected
        ? <span className="badge badge-pill badge-success">{ t('full_text_search_management.connection_status_label_connected') }</span>
        : <span className="badge badge-pill badge-danger">{ t('full_text_search_management.connection_status_label_disconnected') }</span>;
    }

    let indicesStatusLabel = <span className="badge badge-pill badge-secondary">――</span>;
    if (isNormalized != null) {
      indicesStatusLabel = isNormalized
        ? <span className="badge badge-pill badge-info">{ t('full_text_search_management.indices_status_label_normalized') }</span>
        : <span className="badge badge-pill badge-warning">{ t('full_text_search_management.indices_status_label_unnormalized') }</span>;
    }

    return (
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th className="w-25">{t('full_text_search_management.connection_status')}</th>
            <td className="w-75">{connectionStatusLabel}</td>
          </tr>
          <tr>
            <th className="w-25">{t('full_text_search_management.indices_status')}</th>
            <td className="w-75">{indicesStatusLabel}</td>
          </tr>
          <tr>
            <th className="w-25">{t('full_text_search_management.indices_summary')}</th>
            <td className="p-4 w-75">{this.renderIndexInfoPanels()}</td>
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

  isConfigured: PropTypes.bool,
  isConnected: PropTypes.bool,
  isNormalized: PropTypes.bool,
  indicesData: PropTypes.object,
  aliasesData: PropTypes.object,
};

export default withTranslation()(StatusTableWrapper);
