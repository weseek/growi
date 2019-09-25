import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ExportTableMenu extends React.Component {

  constructor(props) {
    super(props);

    this.deleteZipFile = this.deleteZipFile.bind(this);
  }

  async deleteZipFile(fileName) {
    // TODO use appContainer.apiv3.delete
    await this.props.appContainer.apiRequest('delete', `/v3/export/${fileName}`, {});

    this.props.removeZipFileStat(fileName);
    // TODO toastSuccess, toastError
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { t } = this.props;

    return (
      <div className="btn-group admin-user-menu">
        <button type="button" className="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown">
          <i className="icon-settings"></i> <span className="caret"></span>
        </button>
        <ul className="dropdown-menu" role="menu">
          <li className="dropdown-header">Export Menu</li>
          <li>
            <a href={`/_api/v3/export/${this.props.fileName}`}>
              <i className="icon-cloud-download" /> Download
            </a>
          </li>
          <li onClick={() => this.deleteZipFile(this.props.fileName)}>
            <a>
              <i className="icon-trash" /> Delete
            </a>
          </li>
        </ul>
      </div>
    );
  }

}

ExportTableMenu.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  fileName: PropTypes.string.isRequired,
  removeZipFileStat: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ExportTableMenuWrapper = (props) => {
  return createSubscribedElement(ExportTableMenu, props, [AppContainer]);
};

export default withTranslation()(ExportTableMenuWrapper);
