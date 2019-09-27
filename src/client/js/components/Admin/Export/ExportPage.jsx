import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';

import ExportZipFormModal from './ExportZipFormModal';
import ZipFileTable from './ZipFileTable';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collections: [],
      zipFileStats: [],
      isExportModalOpen: false,
    };

    this.onZipFileStatAdd = this.onZipFileStatAdd.bind(this);
    this.onZipFileStatRemove = this.onZipFileStatRemove.bind(this);
    this.openExportModal = this.openExportModal.bind(this);
    this.closeExportModal = this.closeExportModal.bind(this);
  }

  async componentDidMount() {
    // TODO:: use apiv3.get
    // eslint-disable-next-line no-unused-vars
    const [{ collections }, { zipFileStats }] = await Promise.all([
      this.props.appContainer.apiGet('/v3/mongo/collections', {}),
      this.props.appContainer.apiGet('/v3/export/status', {}),
    ]);
    // TODO: toastSuccess, toastError

    this.setState({ collections: ['pages', 'revisions'], zipFileStats }); // FIXME: delete this line and uncomment the line below
    // this.setState({ collections, zipFileStats });
  }

  onZipFileStatAdd(newStat) {
    this.setState((prevState) => {
      return {
        zipFileStats: [...prevState.zipFileStats, newStat],
      };
    });
  }

  async onZipFileStatRemove(fileName) {
    try {
      await this.props.appContainer.apiRequest('delete', `/v3/export/${fileName}`, {});

      this.setState((prevState) => {
        return {
          zipFileStats: prevState.zipFileStats.filter(stat => stat.fileName !== fileName),
        };
      });

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

  openExportModal() {
    this.setState({ isExportModalOpen: true });
  }

  closeExportModal() {
    this.setState({ isExportModalOpen: false });
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2>{t('export_management.export_as_zip')}</h2>
        <div className="alert alert-warning">
          <i className="icon-exclamation"></i> { t('export_management.beta_warning') }
        </div>
        <div className="row my-5">
          <div className="col-xs-offset-3 col-xs-6">
            <button type="submit" className="btn btn-sm btn-primary" onClick={this.openExportModal}>{t('export_management.export')}</button>
          </div>
        </div>
        <ExportZipFormModal
          isOpen={this.state.isExportModalOpen}
          onClose={this.closeExportModal}
          collections={this.state.collections}
          zipFileStats={this.state.zipFileStats}
          onZipFileStatAdd={this.onZipFileStatAdd}
        />
        {this.state.zipFileStats.length > 0 && (
          <ZipFileTable
            zipFileStats={this.state.zipFileStats}
            onZipFileStatRemove={this.onZipFileStatRemove}
          />
        )}
      </Fragment>
    );
  }

}

ExportPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportPageFormWrapper = (props) => {
  return createSubscribedElement(ExportPage, props, [AppContainer]);
};

export default withTranslation()(ExportPageFormWrapper);
