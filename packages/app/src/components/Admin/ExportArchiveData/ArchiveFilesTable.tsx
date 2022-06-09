import React, { FC } from 'react';

import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';


import { withUnstatedContainers } from '../../UnstatedUtils';

import ArchiveFilesTableMenu from './ArchiveFilesTableMenu';

type ArchiveFilesTableProps = {
  appContainer: AppContainer,
  zipFileStats: any[],
  onZipFileStatRemove: () => void,
}

const ArchiveFilesTable: FC<ArchiveFilesTableProps> = (props: ArchiveFilesTableProps) => {
  const { t } = useTranslation();

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
          {props.zipFileStats.map(({ meta, fileName, innerFileStats }) => {
            return (
              <tr key={fileName}>
                <th>{fileName}</th>
                <td>{meta.version}</td>
                <td className="text-capitalize">{innerFileStats.map(fileStat => fileStat.collectionName).join(', ')}</td>
                <td>{meta.exportedAt ? format(new Date(meta.exportedAt), 'yyyy/MM/dd HH:mm:ss') : ''}</td>
                <td>
                  <ArchiveFilesTableMenu
                    fileName={fileName}
                    onZipFileStatRemove={props.onZipFileStatRemove}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const ArchiveFilesTableWrapper = withUnstatedContainers(ArchiveFilesTable, [AppContainer]);

export default ArchiveFilesTableWrapper;
