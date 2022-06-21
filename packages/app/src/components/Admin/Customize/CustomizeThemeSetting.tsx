import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import CustomizeThemeOptions from './CustomizeThemeOptions';

type Props = {
  adminCustomizeContainer: AdminCustomizeContainer
}

const CustomizeThemeSetting = (props: Props): JSX.Element => {

  const { adminCustomizeContainer } = props;
  const { t } = useTranslation();

  const onClickSubmit = useCallback(async() => {
    try {
      await adminCustomizeContainer.updateCustomizeTheme();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, adminCustomizeContainer]);

  const renderDevAlert = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="alert alert-warning">
          <strong>DEBUG MESSAGE:</strong> Live preview for theme is disabled in development mode.
        </div>
      );
    }
  }, []);

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
          {renderDevAlert()}
          <CustomizeThemeOptions />
          <AdminUpdateButtonRow onClick={onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
        </div>
      </div>
    </React.Fragment>
  );
};

const CustomizeThemeSettingWrapper = withUnstatedContainers(CustomizeThemeSetting, [AdminCustomizeContainer]);

export default CustomizeThemeSettingWrapper;
