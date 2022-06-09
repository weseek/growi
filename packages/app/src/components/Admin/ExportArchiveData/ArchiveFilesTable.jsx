import React from 'react';

import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

import ArchiveFilesTableMenu from './ArchiveFilesTableMenu';

class ArchiveFilesTable extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{t('admin:export_management.file')}</th>
              <th>{t('admin:export_management.growi_version')}</th>
              <th>{t('admin:export_management.collections')}</th>
              <th>{t('admin:export_management.exported_at')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.zipFileStats.map(({ meta, fileName, innerFileStats }) => {
              return (
                <tr key={fileName}>
                  <th>{fileName}</th>
                  <td>{meta.version}</td>
                  <td className="text-capitalize">{innerFileStats.map(fileStat => fileStat.collectionName).join(', ')}</td>
                  <td>{meta.exportedAt ? format(new Date(meta.exportedAt), 'yyyy/MM/dd HH:mm:ss') : ''}</td>
                  <td>
                    <ArchiveFilesTableMenu
                      fileName={fileName}
                      onZipFileStatRemove={this.props.onZipFileStatRemove}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

}

ArchiveFilesTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  zipFileStats: PropTypes.arrayOf(PropTypes.object).isRequired,
  onZipFileStatRemove: PropTypes.func.isRequired,
};

const ArchiveFilesTableWrapperFC = (props) => {
  const { t } = useTranslation();
  return <ArchiveFilesTable t={t} {...props} />;
};

/**
 * Wrapper component for using unstated
 */
const ArchiveFilesTableWrapper = withUnstatedContainers(ArchiveFilesTableWrapperFC, [AppContainer]);

export default ArchiveFilesTableWrapper;
