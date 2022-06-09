import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';
// import { toastSuccess, toastError } from '~/client/util/apiNotification';

type ArchiveFilesTableMenuProps = {
  appContainer: AppContainer,
  fileName: string,
  onZipFileStatRemove: (string) => void,
}

const ArchiveFilesTableMenu: FC<ArchiveFilesTableMenuProps> = (props: ArchiveFilesTableMenuProps) => {
  const { t } = useTranslation();

  return (
    <div className="btn-group admin-user-menu dropdown">
      <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle" data-toggle="dropdown">
        <i className="icon-settings"></i> <span className="caret"></span>
      </button>
      <ul className="dropdown-menu" role="menu">
        <li className="dropdown-header">{t('admin:export_management.export_menu')}</li>
        <button type="button" className="dropdown-item" onClick={() => { window.location.href = `/admin/export/${props.fileName}` }}>
          <i className="icon-cloud-download" /> {t('admin:export_management.download')}
        </button>
        <button type="button" className="dropdown-item" role="button" onClick={() => props.onZipFileStatRemove(props.fileName)}>
          <span className="text-danger"><i className="icon-trash" /> {t('admin:export_management.delete')}</span>
        </button>
      </ul>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const ArchiveFilesTableMenuWrapper = withUnstatedContainers(ArchiveFilesTableMenu, [AppContainer]);

export default ArchiveFilesTableMenuWrapper;
