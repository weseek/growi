import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

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

  const submitHandler = useCallback(async() => {
    try {
      await adminCustomizeContainer.updateCustomizeTheme();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
    }
    catch (err) {
      toastError(err);
    }
  }, [t, adminCustomizeContainer]);

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
          <CustomizeThemeOptions />
          <AdminUpdateButtonRow onClick={submitHandler} disabled={adminCustomizeContainer.state.retrieveError != null} />
        </div>
      </div>
    </React.Fragment>
  );
};

const CustomizeThemeSettingWrapper = withUnstatedContainers(CustomizeThemeSetting, [AdminCustomizeContainer]);

export default CustomizeThemeSettingWrapper;
