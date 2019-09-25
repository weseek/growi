import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';

import ExportTableMenu from './ExportTableMenu';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
// import { toastSuccess, toastError } from '../../../util/apiNotification';

class ZipFileTable extends React.Component {

  render() {
    // eslint-disable-next-line no-unused-vars
    const { t } = this.props;

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
                  <ExportTableMenu
                    fileName={fileName}
                    removeZipFileStat={this.props.removeZipFileStat}
                  />
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
