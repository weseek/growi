import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';


import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import WebsocketContainer from '../../../services/WebsocketContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

import ExportZipFormModal from './ExportZipFormModal';
import ZipFileTable from './ZipFileTable';

class ExportPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collections: [],
      zipFileStats: [],
      isExportModalOpen: false,
      isExporting: false,
    };

    this.onZipFileStatAdd = this.onZipFileStatAdd.bind(this);
    this.onZipFileStatRemove = this.onZipFileStatRemove.bind(this);
    this.openExportModal = this.openExportModal.bind(this);
    this.closeExportModal = this.closeExportModal.bind(this);
  }

  async componentWillMount() {
    // TODO:: use apiv3.get
    // eslint-disable-next-line no-unused-vars
    const [{ collections }, { zipFileStats, isExporting }] = await Promise.all([
      this.props.appContainer.apiGet('/v3/mongo/collections', {}),
      this.props.appContainer.apiGet('/v3/export/status', {}),
    ]);
    // TODO: toastSuccess, toastError

    this.setState({
      collections: ['pages', 'revisions'],
      zipFileStats,
      isExporting,
    }); // FIXME: delete this line and uncomment the line below
    // this.setState({ collections, zipFileStats, isExporting });

    this.setupWebsocketEventHandler();
  }

  setupWebsocketEventHandler() {
    const socket = this.props.websocketContainer.getWebSocket();

    socket.on('admin:onProgressForExport', (data) => {
      console.log(data);
    });

    socket.on('admin:onTerminateForExport', (data) => {
      console.log(data);
    });
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
      await this.props.appContainer.apiDelete(`/v3/export/${fileName}`, {});

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
        <div className="alert alert-warning">
          <i className="icon-exclamation"></i> { t('export_management.beta_warning') }
        </div>

        <h2>{t('Export Data')}</h2>

        <button type="button" className="btn btn-default" onClick={this.openExportModal}>{t('export_management.create_new_exported_data')}</button>

        <div className="mt-5">
          <h3>{t('export_management.exported_data_list')}</h3>
          <ZipFileTable
            zipFileStats={this.state.zipFileStats}
            onZipFileStatRemove={this.onZipFileStatRemove}
          />
        </div>

        <div className="mt-5">
          <h3>{t('export_management.exported_data_list')}</h3>
          <ZipFileTable
            zipFileStats={this.state.zipFileStats}
            onZipFileStatRemove={this.onZipFileStatRemove}
          />
        </div>

        <ExportZipFormModal
          isOpen={this.state.isExportModalOpen}
          onClose={this.closeExportModal}
          collections={this.state.collections}
          zipFileStats={this.state.zipFileStats}
          onZipFileStatAdd={this.onZipFileStatAdd}
        />
      </Fragment>
    );
  }

}

ExportPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportPageFormWrapper = (props) => {
  return createSubscribedElement(ExportPage, props, [AppContainer, WebsocketContainer]);
};

export default withTranslation()(ExportPageFormWrapper);
