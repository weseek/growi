import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { useGrowiTheme } from '~/stores/context';


import { withUnstatedContainers } from '../../UnstatedUtils';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

import CustomizeThemeOptions from './CustomizeThemeOptions';

type Props = {
  adminCustomizeContainer: AdminCustomizeContainer
}

const CustomizeThemeSetting = (props: Props): JSX.Element => {

  const { adminCustomizeContainer } = props;
  const { data: currentTheme, mutate: mutateGrowiTheme } = useGrowiTheme();
  const { t } = useTranslation();

  const selectedHandler = useCallback((themeName) => {
    mutateGrowiTheme(themeName);
  }, [mutateGrowiTheme]);

  const submitHandler = useCallback(async() => {
    try {
      if (currentTheme != null) {
        await apiv3Put('/customize-setting/theme', {
          themeType: currentTheme,
        });
      }

      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_settings.theme'), ns: 'commons' }));
    }
    catch (err) {
      toastError(err);
    }
  }, [currentTheme, t]);

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="admin-setting-header">{t('admin:customize_settings.theme')}</h2>
        <CustomizeThemeOptions onSelected={selectedHandler} currentTheme={currentTheme} />
        <AdminUpdateButtonRow onClick={submitHandler} disabled={adminCustomizeContainer.state.retrieveError != null} />
      </div>
    </div>
  );
};

const CustomizeThemeSettingWrapper = withUnstatedContainers(CustomizeThemeSetting, [AdminCustomizeContainer]);

export default CustomizeThemeSettingWrapper;
