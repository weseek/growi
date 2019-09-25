import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ZipFileTable extends React.Component {

  constructor(props) {
    super(props);

    this.deleteZipFile = this.deleteZipFile.bind(this);
  }

  async deleteZipFile(zipFile) {
    // TODO use appContainer.apiv3.delete
    await this.props.appContainer.apiRequest('delete', `/v3/export/${zipFile}`, {});

    this.props.removeZipFileStat(zipFile);
    // TODO toastSuccess, toastError
  }

  render() {
    // const { t } = this.props;

    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>File</th>
            <th>Growi Version</th>
            <th>Collections</th>
            <th>Exported At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.props.zipFileStats.map(({ meta, fileName, fileStats }) => {
            return (
              <tr key={fileName}>
                <th>{fileName}</th>
                <td>{meta.version}</td>
                <td className="text-capitalize">{fileStats.map(fileStat => fileStat.collectionName).join(', ')}</td>
                <td>{meta.exportedAt ? format(new Date(meta.exportedAt), 'yyyy/MM/dd HH:mm:ss') : ''}</td>
                <td>
                  <a href="/_api/v3/export">
                    <button type="button" className="btn btn-sm btn-primary ml-2">Download</button>
                  </a>
                  <button type="button" className="btn btn-sm btn-danger ml-2" onClick={() => this.deleteZipFile(fileName)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

}

ZipFileTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  zipFileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  removeZipFileStat: PropTypes.func.isRequired,
};

/**
 * Wrapper component for using unstated
 */
const ZipFileTableWrapper = (props) => {
  return createSubscribedElement(ZipFileTable, props, [AppContainer]);
};

export default withTranslation()(ZipFileTableWrapper);
