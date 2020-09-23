import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

import UploadForm from './GrowiArchive/UploadForm';
import ImportForm from './GrowiArchive/ImportForm';

class GrowiArchiveSection extends React.Component {

  constructor(props) {
    super(props);

    this.initialState = {
      fileName: null,
      innerFileStats: null,
      isTheSameVersion: true,
    };

    this.state = this.initialState;

    this.handleUpload = this.handleUpload.bind(this);
    this.discardData = this.discardData.bind(this);
    this.resetState = this.resetState.bind(this);
    this.renderDefferentVersionAlert = this.renderDefferentVersionAlert.bind(this);
  }

  async componentWillMount() {
    // get uploaded file status
    const res = await this.props.appContainer.apiv3Get('/import/status');

    if (res.data.zipFileStat != null) {
      const { fileName, innerFileStats } = res.data.zipFileStat;
      this.setState({ fileName, innerFileStats });
    }
  }

  handleUpload({
    meta, fileName, innerFileStats, isTheSameVersion,
  }) {
    this.setState({
      fileName,
      innerFileStats,
      isTheSameVersion: false, // 仮
    });
    console.log(`isTheSameVersion from handleUpload = ${isTheSameVersion}`);
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

  renderDefferentVersionAlert() {
    const { t } = this.props;
    const { isTheSameVersion } = this.state;
    console.log(`versionsNotMetinRenderDefferentVersionAlert=${isTheSameVersion}`);
    return (
      <div className="alert alert-warning mt-3">
        {t('admin:importer_management.growi_settings.errors.versions_not_met')}
      </div>
    );
  }

  resetState() {
    this.setState(this.initialState);
  }

  render() {
    const { t } = this.props;
    const { isTheSameVersion } = this.state;
    console.log(`isTheSameVersion=${isTheSameVersion}`);

    return (
      <Fragment>
        <h2>{t('admin:importer_management.import_growi_archive')}</h2>

        {this.state.fileName != null ? (
          <div className="px-4">
            {isTheSameVersion === false && this.renderDefferentVersionAlert()}
            <ImportForm
              fileName={this.state.fileName}
              innerFileStats={this.state.innerFileStats}
              onDiscard={this.discardData}
            />
          </div>
        )
          : (
            <UploadForm
              onUpload={this.handleUpload}
            />
          )}
      </Fragment>
    );
  }

}

GrowiArchiveSection.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const GrowiArchiveSectionWrapper = withUnstatedContainers(GrowiArchiveSection, [AppContainer]);

export default withTranslation()(GrowiArchiveSectionWrapper);
