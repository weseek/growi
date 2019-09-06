import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportPage extends React.Component {

  constructor(props) {
    super(props);

    this.createZipFile = this.createZipFile.bind(this);
    this.deleteZipFile = this.deleteZipFile.bind(this);
  }

  async createZipFile() {
    // TODO use appContainer.apiv3.post
    await this.props.appContainer.apiPost('/v3/export/pages', {});
    // TODO toastSuccess, toastError
  }

  async deleteZipFile() {
    // TODO use appContainer.apiv3.delete
    // TODO toastSuccess, toastError
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2>Export Data as Zip</h2>
        <button onClick={this.createZipFile}>Generate</button>
        <a href="/_api/v3/export/pages">
          <button>Download</button>
        </a>
        <button onClick={this.deleteZipFile}>Clear</button>
      </Fragment>
    );
  }

}

ExportPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isAclEnabled: PropTypes.bool,
};

/**
 * Wrapper component for using unstated
 */
const ExportPageWrapper = (props) => {
  return createSubscribedElement(ExportPage, props, [AppContainer]);
};

export default withTranslation()(ExportPageWrapper);
