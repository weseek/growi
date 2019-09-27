import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import GrowiZipUploadForm from './GrowiZipUploadForm';
import GrowiZipImportForm from './GrowiZipImportForm';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class GrowiZipImportSection extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      fileName: '',
      fileStats: [],
    };

    this.state = this.initialState;

    this.handleUpload = this.handleUpload.bind(this);
    this.discardData = this.discardData.bind(this);
    this.resetState = this.resetState.bind(this);
  }

  handleUpload({ meta, fileName, fileStats }) {
    this.setState({
      fileName,
      fileStats,
    });
  }

  async discardData() {
    await this.props.appContainer.apiRequest('delete', `/v3/import/${this.state.fileName}`, {});
    this.resetState();
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <legend>{t('importer_management.import_form_growi')}</legend>
        <div className="well well-sm small">
          <ul>
            <li>{t('importer_management.growi_settings.overwrite_documents')}</li>
          </ul>
        </div>

        {this.state.fileName ? (
          <Fragment>
            <GrowiZipImportForm
              fileName={this.state.fileName}
              fileStats={this.state.fileStats}
              onDiscard={this.discardData}
              onPostImport={this.resetState}
            />
          </Fragment>
        ) : (
          <GrowiZipUploadForm
            onUpload={this.handleUpload}
          />
        )}
      </Fragment>
    );
  }

}

GrowiZipImportSection.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiZipImportSectionWrapper = (props) => {
  return createSubscribedElement(GrowiZipImportSection, props, [AppContainer]);
};

export default withTranslation()(GrowiZipImportSectionWrapper);
