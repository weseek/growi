import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import IndicesStatusTable from './IndicesStatusTable';
import RebuildIndexControls from './RebuildIndexControls';

class ElasticsearchManagement extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isNormalized: undefined,
      indicesData: null,
      aliasesData: null,
    };

    this.normalizeIndices = this.normalizeIndices.bind(this);
    this.rebuildIndices = this.rebuildIndices.bind(this);
  }

  async componentWillMount() {
    this.retrieveIndicesStatus();
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
      toastSuccess('Rebuilding is requested');
    }
    catch (e) {
      toastError(e);
    }

    await this.retrieveIndicesStatus();
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

  render() {
    const { t } = this.props;
    const { isNormalized, indicesData, aliasesData } = this.state;

    return (
      <>
        <div className="row">
          <div className="col-xs-12">
            <IndicesStatusTable
              isNormalized={isNormalized}
              indicesData={indicesData}
              aliasesData={aliasesData}
            />
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
            <RebuildIndexControls
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
  return createSubscribedElement(ElasticsearchManagement, props, [AppContainer]);
};

ElasticsearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ElasticsearchManagementWrapper);
