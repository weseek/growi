import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as toastr from 'toastr';


import { createSubscribedElement } from '../UnstatedUtils';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../services/AppContainer';
import WebsocketContainer from '../../services/WebsocketContainer';

import ProgressBar from './Common/ProgressBar';

import ExportZipFormModal from './ExportData/ExportZipFormModal';
import ZipFileTable from './ExportData/ZipFileTable';

class ExportDataPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      collections: [],
      zipFileStats: [],
      progressList: [],
      isExportModalOpen: false,
      isExporting: false,
      isZipping: false,
      isExported: false,
    };

    this.onZipFileStatAdd = this.onZipFileStatAdd.bind(this);
    this.onZipFileStatRemove = this.onZipFileStatRemove.bind(this);
    this.openExportModal = this.openExportModal.bind(this);
    this.closeExportModal = this.closeExportModal.bind(this);
    this.exportingRequestedHandler = this.exportingRequestedHandler.bind(this);
  }

  async componentWillMount() {
    // TODO:: use apiv3.get
    // eslint-disable-next-line no-unused-vars
    const [{ collections }, { status }] = await Promise.all([
      this.props.appContainer.apiGet('/v3/mongo/collections', {}),
      this.props.appContainer.apiGet('/v3/export/status', {}),
    ]);
    // TODO: toastSuccess, toastError

    const { zipFileStats, isExporting, progressList } = status;
    this.setState({
      collections,
      zipFileStats,
      isExporting,
      progressList,
    });

    this.setupWebsocketEventHandler();
  }

  setupWebsocketEventHandler() {
    const socket = this.props.websocketContainer.getWebSocket();

    // websocket event
    socket.on('admin:onProgressForExport', ({ currentCount, totalCount, progressList }) => {
      this.setState({
        isExporting: true,
        progressList,
      });
    });

    // websocket event
    socket.on('admin:onStartZippingForExport', () => {
      this.setState({
        isZipping: true,
      });
    });

    // websocket event
    socket.on('admin:onTerminateForExport', ({ addedZipFileStat }) => {
      const zipFileStats = this.state.zipFileStats.concat([addedZipFileStat]);

      this.setState({
        isExporting: false,
        isZipping: false,
        isExported: true,
        zipFileStats,
      });

      // TODO: toastSuccess, toastError
      toastr.success(undefined, `New Exported Data '${addedZipFileStat.fileName}' is added`, {
        closeButton: true,
        progressBar: true,
        newestOnTop: false,
        showDuration: '100',
        hideDuration: '100',
        timeOut: '1200',
        extendedTimeOut: '150',
      });
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

  /**
   * event handler invoked when export process was requested successfully
   */
  exportingRequestedHandler() {
  }

  renderProgressBarsForCollections() {
    const cols = this.state.progressList.map((progressData) => {
      const { collectionName, currentCount, totalCount } = progressData;
      return (
        <div className="col-md-6" key={collectionName}>
          <ProgressBar
            header={collectionName}
            currentCount={currentCount}
            totalCount={totalCount}
          />
        </div>
      );
    });

    return <div className="row px-3">{cols}</div>;
  }

  renderProgressBarForZipping() {
    const { isZipping, isExported } = this.state;
    const showZippingBar = isZipping || isExported;

    if (!showZippingBar) {
      return <></>;
    }

    return (
      <div className="row px-3">
        <div className="col-md-12" key="progressBarForZipping">
          <ProgressBar
            header="Zip Files"
            currentCount={1}
            totalCount={1}
            isInProgress={isZipping}
          />
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { isExporting, isExported, progressList } = this.state;

    const showExportingData = (isExported || isExporting) && (progressList != null);

    return (
      <Fragment>
        <h2>{t('Export Data')}</h2>

        <button type="button" className="btn btn-default" disabled={isExporting} onClick={this.openExportModal}>
          {t('export_management.create_new_exported_data')}
        </button>

        { showExportingData && (
          <div className="mt-5">
            <h3>{t('export_management.exporting_data_list')}</h3>
            { this.renderProgressBarsForCollections() }
            { this.renderProgressBarForZipping() }
          </div>
        ) }

        <div className="mt-5">
          <h3>{t('export_management.exported_data_list')}</h3>
          <ZipFileTable
            zipFileStats={this.state.zipFileStats}
            onZipFileStatRemove={this.onZipFileStatRemove}
          />
        </div>

        <ExportZipFormModal
          isOpen={this.state.isExportModalOpen}
          onExportingRequested={this.exportingRequestedHandler}
          onClose={this.closeExportModal}
          collections={this.state.collections}
        />
      </Fragment>
    );
  }

}

ExportDataPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  websocketContainer: PropTypes.instanceOf(WebsocketContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportDataPageFormWrapper = (props) => {
  return createSubscribedElement(ExportDataPage, props, [AppContainer, WebsocketContainer]);
};

export default withTranslation()(ExportDataPageFormWrapper);
