import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ExportZipForm from './ExportZipForm';
import ZipFileTable from './ZipFileTable';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      zipFileStats: [],
    };

    this.onZipFileStatAdd = this.onZipFileStatAdd.bind(this);
    this.onZipFileStatRemove = this.onZipFileStatRemove.bind(this);
  }

  async componentDidMount() {
    // TODO: use apiv3.get
    const { zipFileStats } = await this.props.appContainer.apiGet('/v3/export/status', {});
    this.setState({ zipFileStats });
    // TODO toastSuccess, toastError
  }

  onZipFileStatAdd(newStat) {
    this.setState((prevState) => {
      return {
        zipFileStats: [...prevState.zipFileStats, newStat],
      };
    });
  }

  async onZipFileStatRemove(fileName) {
    await this.props.appContainer.apiRequest('delete', `/v3/export/${fileName}`, {});

    this.setState((prevState) => {
      return {
        zipFileStats: prevState.zipFileStats.filter(stat => stat.fileName !== fileName),
      };
    });
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2>{t('export_management.export_as_zip')}</h2>
        <ExportZipForm
          zipFileStats={this.state.zipFileStats}
          onZipFileStatAdd={this.onZipFileStatAdd}
        />
        <ZipFileTable
          zipFileStats={this.state.zipFileStats}
          onZipFileStatRemove={this.onZipFileStatRemove}
        />
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
