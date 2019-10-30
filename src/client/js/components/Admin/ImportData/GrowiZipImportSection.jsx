import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

import GrowiZipUploadForm from './GrowiZipUploadForm';
import GrowiZipImportForm from './GrowiZipImportForm';

class GrowiZipImportSection extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      fileName: null,
      innerFileStats: null,
    };

    this.state = this.initialState;

    this.handleUpload = this.handleUpload.bind(this);
    this.discardData = this.discardData.bind(this);
    this.resetState = this.resetState.bind(this);
  }

  async componentWillMount() {
    // get uploaded file status
    const res = await this.props.appContainer.apiv3Get('/import/status');

    if (res.data.zipFileStat != null) {
      const { fileName, innerFileStats } = res.data.zipFileStat;
      this.setState({ fileName, innerFileStats });
    }
  }

  handleUpload({ meta, fileName, innerFileStats }) {
    this.setState({
      fileName,
      innerFileStats,
    });
  }

  async discardData() {
    try {
      const { fileName } = this.state;
      await this.props.appContainer.apiv3Delete('/import/all');
      this.resetState();

      // TODO: toastSuccess, toastError
      toastr.success(undefined, `Deleted ${fileName}`, {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
    }
    catch (err) {
      // TODO: toastSuccess, toastError
      toastr.error(err, 'Error', {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '3000',
      });
    }
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2>{t('importer_management.import_growi_archive')}</h2>

        { this.state.fileName != null ? (
          <div className="px-4">
            <GrowiZipImportForm
              fileName={this.state.fileName}
              innerFileStats={this.state.innerFileStats}
              onDiscard={this.discardData}
            />
          </div>
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
