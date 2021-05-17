import { FC, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';

import { useTranslation } from '~/i18n';
import { useCustomizeSettingsSWR } from '~/stores/admin';
import { toastSuccess, toastError } from '~/client/js/util/apiNotification';
import { apiv3Put } from '~/utils/apiv3-client';

import { CustomizeThemeOptions } from '~/components/Admin/Customize/CustomizeThemeOptions';
import { themeTypeInputName } from '~/components/Admin/Customize/ThemeColorBox';

type FormValues = {
  themeType: string,
}


export const CustomizeThemeSetting:FC = () => {
  const { t } = useTranslation();
  const { data, mutate } = useCustomizeSettingsSWR();

  const themeTypeMethods = useForm({
    defaultValues: {
      [themeTypeInputName]: data?.themeType,
    },
  });

  const submitHandler: SubmitHandler<FormValues> = async(formValues) => {
    const themeType = formValues[themeTypeInputName];

    try {
      await apiv3Put('/customize-setting/theme', { themeType });
      mutate();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.theme') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    themeTypeMethods.setValue(themeTypeInputName, data?.themeType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.themeType]);

  return (
    <div className="row">
      <FormProvider {...themeTypeMethods}>
        <form role="form" className="col-md-12" onSubmit={themeTypeMethods.handleSubmit(submitHandler)}>
          <h2 className="admin-setting-header">{t('admin:customize_setting.theme')}</h2>
          {process.env.NODE_ENV === 'development' && (
          <div className="alert alert-warning">
            <strong>DEBUG MESSAGE:</strong> Live preview for theme is disabled in development mode.
          </div>
        )}
          <CustomizeThemeOptions />
          <div className="row my-3">
            <div className="mx-auto">
              <button type="submit" className="btn btn-primary">{ t('Update') }</button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
