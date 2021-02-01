import { useState, useEffect, FC } from 'react';

import { useTranslation } from '~/i18n';
import { useCustomizeSettingsSWR } from '~/stores/admin';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

import { CustomizeThemeOptions } from '~/components/Admin/Customize/CustomizeThemeOptions';
import { AdminUpdateButtonRow } from '~/components/Admin/Common/AdminUpdateButtonRow';


export const CustomizeThemeSetting:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useCustomizeSettingsSWR();
  const [themeType, setThemeType] = useState('');

  useEffect(() => {
    if (data?.themeType != null) {
      setThemeType(data.themeType);
    }
  }, [data?.themeType]);

  const onClickSubmit = async() => {

    try {
      await apiv3Put('/customize-setting/theme', { themeType });
      mutate();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
    }
    catch (err) {
      toastError(err);
    }
  };
  return (
    <div className="row">
      <div className="col-12">
        <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
        {process.env.NODE_ENV === 'development' && (
          <div className="alert alert-warning">
            <strong>DEBUG MESSAGE:</strong> development build では、リアルタイムプレビューが無効になります
          </div>
        )}
        <CustomizeThemeOptions currentTheme={data?.themeType} onSelected={e => setThemeType(e)} />
        <AdminUpdateButtonRow onClick={onClickSubmit} />
      </div>
    </div>
  );
};
